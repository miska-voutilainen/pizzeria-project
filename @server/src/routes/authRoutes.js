import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { sendVerificationEmail } from '../../services/emailService.js';
import { createToken, validateToken, markTokenUsed } from '../../services/tokenService.js';
import createSessionService from '../../services/sessionService.js';
import { handleFailedLogin } from '../../services/userService.js';

function createAuthRoutes(db) {
  const router = express.Router();
  const { sessionMiddleware, createSession } = createSessionService(db);
  router.use(sessionMiddleware);
  const userDataCollection = db.collection('userData');

  router.post(
    '/login',
    [
      body('username').trim().notEmpty().withMessage('Username is required'),
      body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
      body('password').trim().notEmpty().withMessage('Password is required'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }
      const { username, password } = req.body;
      try {
        const user = await userDataCollection.findOne({ username });
        if (!user) {
          await handleFailedLogin(db, username);
          return res.status(401).json({ message: 'Invalid username or password' });
        }
        if (user.accountStatus === 'locked') {
          return res.status(403).json({ message: 'Account is locked' });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          await handleFailedLogin(db, username);
          return res.status(401).json({ message: 'Invalid username or password' });
        }
        const now = new Date();
        await userDataCollection.updateOne(
          { _id: user._id },
          {
            $set: { lastLoginAt: now, accountStatus: 'active', failedLoginCount: 0 },
            $inc: { loginCount: 1 },
          }
        );
        const sessionToken = await createSession(user.userId, req, res);
        res.status(200).json({ message: 'Login successful', sessionToken });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  router.get('/unlock-account/:token', async (req, res) => {
    const { token } = req.params;
    try {
      const tokenDoc = await validateToken(db, token, 'unlock');
      if (!tokenDoc) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
      const user = await userDataCollection.findOne({ userId: tokenDoc.userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (user.accountStatus === 'active') {
        await markTokenUsed(db, tokenDoc._id);
        return res.status(200).json({ message: 'Account is already active' });
      }
      await userDataCollection.updateOne(
        { _id: user._id },
        { $set: { accountStatus: 'active', failedLoginCount: 0 } }
      );
      await markTokenUsed(db, tokenDoc._id);
      res.status(200).json({ message: 'Account unlocked successfully' });
    } catch (error) {
      console.error('Unlock error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.post('/send-verify-link', [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    const { username, email } = req.body;
    const emailLower = email.toLowerCase();
    try {
      const exists = await userDataCollection.findOne({
        $or: [{ username }, { email: emailLower }]
      });
      if (exists) {
        return res.status(409).json({ message: 'Username or email already in use' });
      }
      const userId = randomUUID();
      const tempUser = {
        userId,
        username,
        email: emailLower,
        emailVerified: false,
        accountStatus: 'inactive',
        createdAt: new Date(),
      };
      await userDataCollection.insertOne(tempUser);
      const token = await createToken(db, userId, 'verify-email', 15 / 60); // 15 min (converted to hours)
      const verifyLink = `http://localhost:3001/api/verify-email/${token}`;
      await sendVerificationEmail(emailLower, username, verifyLink);
      res.json({ message: 'Verification email sent. Click the link to continue.' });
    } catch (err) {
      console.error('send-verify-link error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.post('/check-email-verified', async (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    try {
      const user = await userDataCollection.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ verified: user.emailVerified || false });
    } catch (err) {
      console.error('check-email-verified error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.post('/register', [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    const { username, password } = req.body;
    try {
      const user = await userDataCollection.findOne({ username });
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (!user.emailVerified) return res.status(403).json({ message: 'Email not verified' });
      if (user.accountStatus === 'active') return res.status(400).json({ message: 'Already registered' });
      const passwordHash = await bcrypt.hash(password, 14);
      const fullUserData = {
        userId: user.userId,
        username: user.username,
        firstName: "",
        lastName: "",
        email: user.email,
        emailVerified: true,
        address: { street: "", city: "", zip: "" },
        passwordHash,
        lastPasswordChange: new Date(),
        passwordResetRequired: false,
        is2faEnabled: false,
        last2faVerifiedAt: null,
        role: "customer",
        accountStatus: "active",
        createdAt: user.createdAt,
        updatedAt: new Date(),
        lastLoginAt: null,
        loginCount: 0,
        failedLoginCount: 0
      };
      await userDataCollection.replaceOne({ userId: user.userId }, fullUserData);
      res.json({ message: 'Registration complete! Redirecting to login...' });
    } catch (err) {
      console.error('register error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.get('/verify-email/:token', async (req, res) => {
    const { token } = req.params;
    try {
      const tokenDoc = await validateToken(db, token, 'verify-email');
      if (!tokenDoc) {
        return res.status(400).json({ message: 'Invalid or expired link' });
      }
      const user = await userDataCollection.findOne({ userId: tokenDoc.userId });
      if (!user) {
        await markTokenUsed(db, tokenDoc._id);
        return res.status(404).json({ message: 'User not found' });
      }
      if (user.emailVerified) {
        await markTokenUsed(db, tokenDoc._id);
        return res.json({ message: 'Email already verified. You can continue.' });
      }
      await userDataCollection.updateOne(
        { userId: user.userId },
        { $set: { emailVerified: true, updatedAt: new Date() } }
      );
      await markTokenUsed(db, tokenDoc._id);
      res.json({
        message: 'Email verified! Close this tab and continue registration.'
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    try {
      const tokenDoc = await validateToken(db, token, 'reset');
      if (!tokenDoc) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
      res.status(200).json({ message: 'Valid token, proceed to reset', token });
    } catch (error) {
      console.error('Reset token validation error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password)) {
      return res.status(400).json({ message: 'Password must include uppercase, lowercase, and a number' });
    }
    try {
      const tokenDoc = await validateToken(db, token, 'reset');
      if (!tokenDoc) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
      const user = await userDataCollection.findOne({ userId: tokenDoc.userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const passwordHash = await bcrypt.hash(password, 14);
      await userDataCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            passwordHash,
            lastPasswordChange: new Date(),
            accountStatus: 'active',
            failedLoginCount: 0
          }
        }
      );
      await markTokenUsed(db, tokenDoc._id);
      res.status(200).json({ message: 'Password reset successful and account unlocked' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  return router;
}

export default createAuthRoutes;
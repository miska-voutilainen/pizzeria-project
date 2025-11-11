// authRoutes.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { sendVerificationEmail } from '../../services/emailService.js';
import {
  createToken,
  validateToken,
  markTokenUsed,
} from '../../services/tokenService.js';
import createSessionService from '../../services/sessionService.js';
import { handleFailedLogin } from '../../services/userService.js';

function createAuthRoutes(pool) {
  const router = express.Router();
  const { sessionMiddleware, createSession } = createSessionService(pool);
  router.use(sessionMiddleware);

  // -----------------------------------------------------------------
  // LOGIN
  // -----------------------------------------------------------------
  router.post(
    '/login',
    [
      body('username').trim().notEmpty().isLength({ min: 3 }),
      body('password').trim().notEmpty().isLength({ min: 6 }),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { username, password } = req.body;

      try {
        const [rows] = await pool.execute(
          `SELECT * FROM userData WHERE username = ?`,
          [username]
        );
        const user = rows[0];

        if (!user) {
          await handleFailedLogin(pool, username);
          return res.status(401).json({ message: 'Invalid username or password' });
        }
        if (user.accountStatus === 'locked') {
          return res.status(403).json({ message: 'Account is locked' });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
          await handleFailedLogin(pool, username);
          return res.status(401).json({ message: 'Invalid username or password' });
        }

        const now = new Date();
        await pool.execute(
          `UPDATE userData
           SET lastLoginAt = ?, accountStatus = 'active', failedLoginCount = 0, loginCount = loginCount + 1
           WHERE _id = ?`,
          [now, user._id]
        );

        const sessionToken = await createSession(user.userId, req, res);
        res.json({ message: 'Login successful', sessionToken });
      } catch (e) {
        console.error('Login error:', e);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  // -----------------------------------------------------------------
  // UNLOCK ACCOUNT
  // -----------------------------------------------------------------
  router.get('/unlock-account/:token', async (req, res) => {
    const { token } = req.params;
    try {
      const tokenDoc = await validateToken(pool, token, 'unlock');
      if (!tokenDoc) return res.status(400).json({ message: 'Invalid or expired token' });

      const [users] = await pool.execute(
        `SELECT * FROM userData WHERE userId = ?`,
        [tokenDoc.userId]
      );
      const user = users[0];
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (user.accountStatus === 'active') {
        await markTokenUsed(pool, tokenDoc._id);
        return res.json({ message: 'Account is already active' });
      }

      await pool.execute(
        `UPDATE userData SET accountStatus = 'active', failedLoginCount = 0 WHERE _id = ?`,
        [user._id]
      );
      await markTokenUsed(pool, tokenDoc._id);
      res.json({ message: 'Account unlocked successfully' });
    } catch (e) {
      console.error('Unlock error:', e);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // -----------------------------------------------------------------
  // SEND VERIFY LINK (pre-registration)
  // -----------------------------------------------------------------
  router.post(
    '/send-verify-link',
    [
      body('username').trim().isLength({ min: 3 }),
      body('email').isEmail(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

      const { username, email } = req.body;
      const emailLower = email.toLowerCase();

      try {
        const [exists] = await pool.execute(
          `SELECT 1 FROM userData WHERE username = ? OR email = ? LIMIT 1`,
          [username, emailLower]
        );
        if (exists.length) return res.status(409).json({ message: 'Username or email already in use' });

        const userId = randomUUID();
        await pool.execute(
          `INSERT INTO userData
            (_id, userId, username, email, emailVerified, accountStatus, createdAt)
           VALUES (UUID(), ?, ?, ?, FALSE, 'inactive', NOW())`,
          [userId, username, emailLower]
        );

        const token = await createToken(pool, userId, 'verify-email', 0.25); // 15 min
        const verifyLink = `http://localhost:3001/api/verify-email/${token}`;
        console.log('Sending verification email to:', emailLower);
        console.log('Verify link:', verifyLink);
        await sendVerificationEmail(emailLower, username, verifyLink);
        console.log('Verification email sent');
        res.json({ message: 'Verification email sent. Click the link to continue.' });
      } catch (e) {
        console.error('send-verify-link error:', e);
        res.status(500).json({ message: 'Server error' });
      }
    }
  );

  // -----------------------------------------------------------------
  // CHECK EMAIL VERIFIED
  // -----------------------------------------------------------------
  router.post('/check-email-verified', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Username is required' });

    try {
      const [rows] = await pool.execute(
        `SELECT emailVerified FROM userData WHERE username = ?`,
        [username]
      );
      if (!rows.length) return res.status(404).json({ message: 'User not found' });
      res.json({ verified: !!rows[0].emailVerified });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // -----------------------------------------------------------------
  // REGISTER (after verification)
  // -----------------------------------------------------------------
  router.post(
    '/register',
    [
      body('username').trim().isLength({ min: 3 }),
      body('password').isLength({ min: 6 }),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

      const { username, password } = req.body;

      try {
        const [rows] = await pool.execute(
          `SELECT * FROM userData WHERE username = ?`,
          [username]
        );
        const user = rows[0];
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.emailVerified) return res.status(403).json({ message: 'Email not verified' });
        if (user.accountStatus === 'active') return res.status(400).json({ message: 'Already registered' });

        const passwordHash = await bcrypt.hash(password, 14);
        await pool.execute(
          `UPDATE userData SET
              firstName = '',
              lastName = '',
              address = JSON_OBJECT('street','', 'city','', 'zip',''),
              passwordHash = ?,
              lastPasswordChange = NOW(),
              passwordResetRequired = FALSE,
              is2faEnabled = FALSE,
              last2faVerifiedAt = NULL,
              role = 'customer',
              accountStatus = 'active',
              updatedAt = NOW()
            WHERE userId = ?`,
          [passwordHash, user.userId]
        );

        res.json({ message: 'Registration complete! Redirecting to login...' });
      } catch (e) {
        console.error('register error:', e);
        res.status(500).json({ message: 'Server error' });
      }
    }
  );

  // -----------------------------------------------------------------
  // VERIFY EMAIL
  // -----------------------------------------------------------------
  router.get('/verify-email/:token', async (req, res) => {
    const { token } = req.params;
    try {
      const tokenDoc = await validateToken(pool, token, 'verify-email');
      if (!tokenDoc) return res.status(400).json({ message: 'Invalid or expired link' });

      const [users] = await pool.execute(
        `SELECT * FROM userData WHERE userId = ?`,
        [tokenDoc.userId]
      );
      const user = users[0];
      if (!user) {
        await markTokenUsed(pool, tokenDoc._id);
        return res.status(404).json({ message: 'User not found' });
      }
      if (user.emailVerified) {
        await markTokenUsed(pool, tokenDoc._id);
        return res.json({ message: 'Email already verified. You can continue.' });
      }

      await pool.execute(
        `UPDATE userData SET emailVerified = TRUE, updatedAt = NOW() WHERE userId = ?`,
        [user.userId]
      );
      await markTokenUsed(pool, tokenDoc._id);
      res.json({ message: 'Email verified! Close this tab and continue registration.' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // -----------------------------------------------------------------
  // PASSWORD RESET (validate token)
  // -----------------------------------------------------------------
  router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    try {
      const tokenDoc = await validateToken(pool, token, 'reset');
      if (!tokenDoc) return res.status(400).json({ message: 'Invalid or expired token' });
      res.json({ message: 'Valid token, proceed to reset', token });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // -----------------------------------------------------------------
  // PASSWORD RESET (submit new password)
  // -----------------------------------------------------------------
  router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: 'Password is required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password))
      return res.status(400).json({ message: 'Password must include uppercase, lowercase, and a number' });

    try {
      const tokenDoc = await validateToken(pool, token, 'reset');
      if (!tokenDoc) return res.status(400).json({ message: 'Invalid or expired token' });

      const [users] = await pool.execute(
        `SELECT * FROM userData WHERE userId = ?`,
        [tokenDoc.userId]
      );
      const user = users[0];
      if (!user) return res.status(404).json({ message: 'User not found' });

      const passwordHash = await bcrypt.hash(password, 14);
      await pool.execute(
        `UPDATE userData
         SET passwordHash = ?, lastPasswordChange = NOW(),
             accountStatus = 'active', failedLoginCount = 0
         WHERE _id = ?`,
        [passwordHash, user._id]
      );

      await markTokenUsed(pool, tokenDoc._id);
      res.json({ message: 'Password reset successful and account unlocked' });
    } catch (e) {
      console.error('Reset password error:', e);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  return router;
}

export default createAuthRoutes;
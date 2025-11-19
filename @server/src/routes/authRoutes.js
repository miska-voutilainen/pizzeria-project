// src/routes/authRoutes.js
import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "../../services/emailService.js";
import {
  createToken,
  validateToken,
  markTokenUsed,
} from "../../services/tokenService.js";
import { handleFailedLogin } from "../../services/userService.js";

function createAuthRoutes({ pool, createSession, destroySession, destroyAllSessions }) {
  const router = express.Router();

  router.post(
    "/login",
    [
      body("username").trim().notEmpty().isLength({ min: 3 }),
      body("password").trim().notEmpty().isLength({ min: 6 }),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
      }

      const { username, password } = req.body;

      try {
        const [rows] = await pool.execute(`SELECT * FROM user_data WHERE username = ?`, [username]);
        const user = rows[0];

        if (!user || user.accountStatus === "locked") {
          await handleFailedLogin(pool, username);
          return res.status(401).json({ message: "Invalid username or password" });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
          await handleFailedLogin(pool, username);
          return res.status(401).json({ message: "Invalid username or password" });
        }

        // Update login stats
        await pool.execute(
          `UPDATE user_data
           SET lastLoginAt = NOW(),
               accountStatus = 'active',
               failedLoginCount = 0,
               loginCount = loginCount + 1
           WHERE _id = ?`,
          [user._id]
        );

        // Create session + set HttpOnly cookie (cookie name: "sid")
        await createSession(user.userId, req, res);

        return res.json({ message: "Login successful" });
      } catch (e) {
        console.error("Login error:", e);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  /*
  router.post("/logout", async (req, res) => {
    await destroySession(req, res);
    res.json({ message: "Logged out successfully" });
  });
  */

  router.get("/unlock-account/:token", async (req, res) => {
    const { token } = req.params;
    try {
      const tokenDoc = await validateToken(pool, token, "unlock");
      if (!tokenDoc) return res.status(400).json({ message: "Invalid or expired token" });

      const [users] = await pool.execute(`SELECT * FROM user_data WHERE userId = ?`, [tokenDoc.userId]);
      const user = users[0];
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.accountStatus === "active") {
        await markTokenUsed(pool, tokenDoc._id);
        return res.json({ message: "Account is already active" });
      }

      await pool.execute(
        `UPDATE user_data SET accountStatus = 'active', failedLoginCount = 0 WHERE _id = ?`,
        [user._id]
      );
      await markTokenUsed(pool, tokenDoc._id);
      res.json({ message: "Account unlocked successfully" });
    } catch (e) {
      console.error("Unlock error:", e);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post(
    "/send-verify-link",
    [
      body("username").trim().isLength({ min: 3 }),
      body("email").isEmail().normalizeEmail(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

      const { username, email } = req.body;
      const emailLower = email.toLowerCase();

      try {
        const [exists] = await pool.execute(
          `SELECT 1 FROM user_data WHERE username = ? OR email = ? LIMIT 1`,
          [username, emailLower]
        );
        if (exists.length) {
          return res.status(409).json({ message: "Username or email already in use" });
        }

        const userId = randomBytes(16).toString("hex");

        await pool.execute(
          `INSERT INTO user_data
            (_id, userId, username, email, emailVerified, accountStatus, createdAt)
           VALUES (UUID(), ?, ?, ?, FALSE, 'inactive', NOW())`,
          [userId, username, emailLower]
        );

        const token = await createToken(pool, userId, "verify-email", 0.25); // 15 min
        const verifyLink = `http://localhost:3001/api/verify-email/${token}`;

        await sendVerificationEmail(emailLower, username, verifyLink);

        res.json({ message: "Verification email sent. Check your inbox." });
      } catch (e) {
        console.error("send-verify-link error:", e);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  router.post("/check-email-verified", async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "Username is required" });

    try {
      const [rows] = await pool.execute(
        `SELECT emailVerified FROM user_data WHERE username = ?`,
        [username]
      );
      if (!rows.length) return res.status(404).json({ message: "User not found" });

      res.json({ verified: !!rows[0].emailVerified });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post(
    "/register",
    [
      body("username").trim().isLength({ min: 3 }),
      body("password").isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

      const { username, password } = req.body;

      try {
        const [rows] = await pool.execute(`SELECT * FROM user_data WHERE username = ?`, [username]);
        const user = rows[0];
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!user.emailVerified) return res.status(403).json({ message: "Email not verified" });
        if (user.accountStatus === "active") return res.status(400).json({ message: "Already registered" });

        const passwordHash = await bcrypt.hash(password, 14);

        await pool.execute(
          `UPDATE user_data SET
              passwordHash = ?,
              lastPasswordChange = NOW(),
              passwordResetRequired = FALSE,
              role = 'user',
              accountStatus = 'active',
              updatedAt = NOW()
           WHERE userId = ?`,
          [passwordHash, user.userId]
        );

        res.json({ message: "Registration complete! You can now log in." });
      } catch (e) {
        console.error("register error:", e);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  router.get("/verify-email/:token", async (req, res) => {
    const { token } = req.params;
    try {
      const tokenDoc = await validateToken(pool, token, "verify-email");
      if (!tokenDoc) return res.status(400).json({ message: "Invalid or expired link" });

      const [users] = await pool.execute(`SELECT * FROM user_data WHERE userId = ?`, [tokenDoc.userId]);
      const user = users[0];
      if (!user) {
        await markTokenUsed(pool, tokenDoc._id);
        return res.status(404).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        await markTokenUsed(pool, tokenDoc._id);
        return res.json({ message: "Email already verified" });
      }

      await pool.execute(
        `UPDATE user_data SET emailVerified = TRUE, updatedAt = NOW() WHERE userId = ?`,
        [user.userId]
      );
      await markTokenUsed(pool, tokenDoc._id);

      res.json({ message: "Email verified! You can now set your password." });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.get("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    try {
      const tokenDoc = await validateToken(pool, token, "reset");
      if (!tokenDoc) return res.status(400).json({ message: "Invalid or expired token" });
      res.json({ message: "Token valid", valid: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({ message: "Password too weak" });
    }

    try {
      const tokenDoc = await validateToken(pool, token, "reset");
      if (!tokenDoc) return res.status(400).json({ message: "Invalid or expired token" });

      const [users] = await pool.execute(`SELECT * FROM user_data WHERE userId = ?`, [tokenDoc.userId]);
      const user = users[0];
      if (!user) return res.status(404).json({ message: "User not found" });

      const passwordHash = await bcrypt.hash(password, 14);

      await pool.execute(
        `UPDATE user_data
         SET passwordHash = ?, lastPasswordChange = NOW(),
             accountStatus = 'active', failedLoginCount = 0
         WHERE userId = ?`,
        [passwordHash, user.userId]
      );

      await markTokenUsed(pool, tokenDoc._id);

      res.json({ message: "Password reset successful" });
    } catch (e) {
      console.error("Reset password error:", e);
      res.status(500).json({ message: "Server error" });
    }
  });

  return router;
}

export default createAuthRoutes;
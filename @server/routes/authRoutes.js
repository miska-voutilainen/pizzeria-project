import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

import { sendVerificationEmail } from "../services/emailService.js";
import {
  createToken,
  validateToken,
  markTokenUsed,
} from "../services/tokenService.js";
import { handleFailedLogin } from "../services/userService.js";

function createAuthRoutes({ pool, createSession, destroySession }) {
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
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { username, password } = req.body;

      try {
        const [rows] = await pool.execute(
          `SELECT * FROM user_data WHERE username = ?`,
          [username]
        );
        const user = rows[0];

        if (!user || user.accountStatus === "locked") {
          await handleFailedLogin(pool, username);
          return res
            .status(401)
            .json({ message: "Invalid username or password" });
        }

        const isValidPassword = await bcrypt.compare(
          password,
          user.passwordHash
        );
        if (!isValidPassword) {
          await handleFailedLogin(pool, username);
          return res
            .status(401)
            .json({ message: "Invalid username or password" });
        }

        await pool.execute(
          `UPDATE user_data
           SET lastLoginAt = NOW(),
               accountStatus = 'active',
               failedLoginCount = 0,
               loginCount = loginCount + 1
           WHERE _id = ?`,
          [user._id]
        );

        await createSession(user.userId, req, res);

        return res.json({ message: "Login successful" });
      } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  router.get("/unlock-account/:token", async (req, res) => {
    const { token } = req.params;

    try {
      const tokenDoc = await validateToken(pool, token, "unlock");
      if (!tokenDoc) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const [users] = await pool.execute(
        `SELECT * FROM user_data WHERE userId = ?`,
        [tokenDoc.userId]
      );
      const user = users[0];

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.accountStatus === "active") {
        await markTokenUsed(pool, tokenDoc._id);
        return res.json({ message: "Account is already active" });
      }

      await pool.execute(
        `UPDATE user_data 
         SET accountStatus = 'active', failedLoginCount = 0 
         WHERE _id = ?`,
        [user._id]
      );

      await markTokenUsed(pool, tokenDoc._id);
      return res.json({ message: "Account unlocked successfully" });
    } catch (error) {
      console.error("Unlock account error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/send-verify-link", async (req, res) => {
    const { username } = req.body;

    try {
      const [rows] = await pool.execute(
        `SELECT userId, email, emailVerified FROM user_data WHERE username = ?`,
        [username]
      );
      const user = rows[0];

      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.emailVerified) {
        return res.json({ message: "Email already verified" });
      }

      const token = await createToken(pool, user.userId, "verify-email", 24);
      const verifyLink = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/verify-email/${token}`;

      await sendVerificationEmail(user.email, username, verifyLink);

      return res.json({ message: "Verification email sent!" });
    } catch (error) {
      console.error("Send verify link error:", error);
      return res.status(500).json({ message: "Failed to send email" });
    }
  });

  router.post("/check-email-verified", async (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    try {
      const [rows] = await pool.execute(
        `SELECT emailVerified FROM user_data WHERE username = ?`,
        [username]
      );

      if (!rows.length) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json({ verified: !!rows[0].emailVerified });
    } catch (error) {
      console.error("Check email verified error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  router.post(
    "/register",
    [
      body("username").trim().isLength({ min: 3, max: 30 }).escape(),
      body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required"),
      body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { username, email, password } = req.body;

      try {
        const [existing] = await pool.execute(
          `SELECT username FROM user_data WHERE username = ? OR email = ?`,
          [username, email]
        );

        if (existing.length > 0) {
          const field =
            existing[0].username === username ? "Username" : "Email";
          return res.status(409).json({ message: `${field} is already taken` });
        }

        const userId = randomBytes(16).toString("hex");
        const passwordHash = await bcrypt.hash(password, 14);

        await pool.execute(
          `INSERT INTO user_data 
           (_id, userId, username, email, passwordHash, emailVerified, accountStatus, role, createdAt)
           VALUES (UUID(), ?, ?, ?, ?, 0, 'active', 'user', NOW())`,
          [userId, username, email, passwordHash]
        );

        return res.status(201).json({
          message: "Registration successful! You can now log in.",
        });
      } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Server error" });
      }
    }
  );

  router.get("/verify-email/:token", async (req, res) => {
    const { token } = req.params;

    try {
      const tokenDoc = await validateToken(pool, token, "verify-email");
      if (!tokenDoc) {
        return res.status(400).json({ message: "Invalid or expired link" });
      }

      const [users] = await pool.execute(
        `SELECT * FROM user_data WHERE userId = ?`,
        [tokenDoc.userId]
      );
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
      return res.json({ message: "Email verified! You can now log in." });
    } catch (error) {
      console.error("Verify email error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  router.get("/reset-password/:token", async (req, res) => {
    const { token } = req.params;

    try {
      const tokenDoc = await validateToken(pool, token, "reset");
      if (!tokenDoc) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      return res.json({ message: "Token valid", valid: true });
    } catch (error) {
      console.error("Reset password token check error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (
      !password ||
      password.length < 8 ||
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
    ) {
      return res.status(400).json({ message: "Password too weak" });
    }

    try {
      const tokenDoc = await validateToken(pool, token, "reset");
      if (!tokenDoc) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const [users] = await pool.execute(
        `SELECT * FROM user_data WHERE userId = ?`,
        [tokenDoc.userId]
      );
      const user = users[0];

      if (!user) {
        return res.status.res.status(404).json({ message: "User not found" });
      }

      const passwordHash = await bcrypt.hash(password, 14);

      await pool.execute(
        `UPDATE user_data
         SET passwordHash = ?, 
             lastPasswordChange = NOW(),
             accountStatus = 'active', 
             failedLoginCount = 0
         WHERE userId = ?`,
        [passwordHash, user.userId]
      );

      await markTokenUsed(pool, tokenDoc._id);
      return res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  return router;
}

export default createAuthRoutes;

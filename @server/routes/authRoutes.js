import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

import {
  sendVerificationEmail,
  send2FAEmail,
} from "../services/emailService.js";
import {
  createToken,
  validateToken,
  markTokenUsed,
} from "../services/tokenService.js";
import { handleFailedLogin } from "../services/userService.js";

function createAuthRoutes({
  pool,
  createSession,
  destroySession,
  destroyAllSessions,
}) {
  const router = express.Router();

  // REPLACE ONLY THIS ENTIRE BLOCK (from router.post("/login", ... ) to its closing }); )
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
          await handleFailedLogin(pool, username, req);
          return res
            .status(401)
            .json({ message: "Invalid username or password" });
        }
        const isValidPassword = await bcrypt.compare(
          password,
          user.passwordHash
        );
        if (!isValidPassword) {
          await handleFailedLogin(pool, username, req);
          return res
            .status(401)
            .json({ message: "Invalid username or password" });
        }

        // THIS IS THE ONLY NEW LOGIC — ADMINS ARE FORCED TO 2FA EVERY TIME
        if (user.role === "administrator" || user.is2faEnabled) {
          const code = Math.floor(1000 + Math.random() * 9000).toString();
          const now = new Date();
          const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

          await pool.execute(
            `INSERT INTO user_tokens
            (userId, token, type, createdAt, expiresAt, used, ipAddress, userAgent)
            VALUES (?, ?, '2fa-login', ?, ?, FALSE, ?, ?)`,
            [
              user.userId,
              code,
              now,
              expiresAt,
              req.ip || "unknown",
              req.get("User-Agent") || "unknown",
            ]
          );

          await send2FAEmail(user.email, user.username, code);
          return res.json({
            message: "2FA code sent to your email",
            requires2FA: true,
            userId: user.userId,
          });
        }

        // Normal login (non-admin AND 2FA disabled)
        await pool.execute(
          `UPDATE user_data
          SET lastLoginAt = NOW(),
              accountStatus = 'active',
              failedLoginCount = 0,
              loginCount = loginCount + 1
          WHERE userId = ?`,
          [user.userId]
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
        await markTokenUsed(pool, token);
        return res.json({ message: "Account is already active" });
      }

      await pool.execute(
        `UPDATE user_data 
         SET accountStatus = 'active', failedLoginCount = 0 
         WHERE userId = ?`,
        [user.userId]
      );

      await markTokenUsed(pool, token);
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

      const token = await createToken(
        pool,
        user.userId,
        "verify-email",
        24,
        req
      );
      const verifyLink = `${
        process.env.SERVER_URI || "http://localhost:3001"
      }/api/verify-email/${token}`;

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

        const userId = Math.floor(100000 + Math.random() * 900000);
        const passwordHash = await bcrypt.hash(password, 14);
        await pool.execute(
          `INSERT INTO user_data 
           (userId, username, email, passwordHash, emailVerified, accountStatus, role, createdAt)
           VALUES (?, ?, ?, ?, 0, 'active', 'user', NOW())`,
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
        await markTokenUsed(pool, token);
        return res.status(404).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        await markTokenUsed(pool, token);
        return res.json({ message: "Email already verified" });
      }

      await pool.execute(
        `UPDATE user_data SET emailVerified = TRUE, updatedAt = NOW() WHERE userId = ?`,
        [user.userId]
      );

      await markTokenUsed(pool, token);
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

      await markTokenUsed(pool, token);
      return res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  router.get("/check", (req, res) => {
    if (req.user) {
      return res.json({
        authenticated: true,
        user: {
          id: req.user.id,
          username: req.user.username || "Unknown",
          role: req.user.role,
          twoFactorEnabled: req.user.is2faEnabled || false,
          emailVerified: req.user.emailVerified || false,
        },
      });
    }

    return res.status(401).json({ authenticated: false, user: null });
  });

  router.post("/verify-login-2fa", async (req, res) => {
    const { code, userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ message: "Code and user ID required" });
    }

    try {
      // Find the token that matches the code for login 2FA
      const [tokens] = await pool.execute(
        `SELECT token FROM user_tokens WHERE token = ? AND userId = ? AND type = '2fa-login' AND used = FALSE AND expiresAt > NOW()`,
        [code, userId]
      );

      if (tokens.length === 0) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }

      // Mark token as used
      await pool.execute(`UPDATE user_tokens SET used = TRUE WHERE token = ?`, [
        code,
      ]);

      // Get user data to complete login
      const [users] = await pool.execute(
        `SELECT * FROM user_data WHERE userId = ?`,
        [userId]
      );
      const user = users[0];

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update login statistics and create session
      await pool.execute(
        `UPDATE user_data
         SET lastLoginAt = NOW(),
             accountStatus = 'active',
             failedLoginCount = 0,
             loginCount = loginCount + 1
         WHERE userId = ?`,
        [user.userId]
      );

      // Delete any existing sessions for this user before creating a new one
      // (handles the PRIMARY key constraint on userId)
      await pool.execute(`DELETE FROM user_sessions WHERE userId = ?`, [
        user.userId,
      ]);

      await createSession(user.userId, req, res);

      return res.json({ message: "Login successful" });
    } catch (error) {
      console.error("2FA login verification error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  router.post("/logout", destroySession, (req, res) => {
    res.json({ message: "Logged out successfully" });
  });

  // 2FA Routes
  router.post("/send-2fa-code", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const [users] = await pool.execute(
        `SELECT email, username, emailVerified FROM user_data WHERE userId = ?`,
        [req.user.userId]
      );
      const user = users[0];

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if email is verified before allowing 2FA setup
      if (!user.emailVerified) {
        return res.status(400).json({
          message: "Email verification required",
          requiresEmailVerification: true,
        });
      }

      // Generate a 4-digit code
      const code = Math.floor(1000 + Math.random() * 9000).toString();

      // Store the code directly as token in user_tokens table with 15-minute expiry
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

      await pool.execute(
        `INSERT INTO user_tokens 
         (userId, token, type, createdAt, expiresAt, used, ipAddress, userAgent)
         VALUES (?, ?, '2fa-setup', ?, ?, FALSE, ?, ?)`,
        [
          req.user.userId,
          code,
          now,
          expiresAt,
          req.ip || "unknown",
          req.get("User-Agent") || "unknown",
        ]
      );

      // Send email with the code
      await send2FAEmail(user.email, user.username, code);

      return res.json({ message: "2FA code sent to your email" });
    } catch (error) {
      console.error("Send 2FA code error:", error);
      return res.status(500).json({ message: "Failed to send 2FA code" });
    }
  });

  router.post("/verify-2fa-code", async (req, res) => {
    const { code } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!code) {
      return res.status(400).json({ message: "Code required" });
    }

    try {
      // Find the token that matches the code
      const [tokens] = await pool.execute(
        `SELECT token FROM user_tokens WHERE token = ? AND userId = ? AND type = '2fa-setup' AND used = FALSE AND expiresAt > NOW()`,
        [code, req.user.userId]
      );

      if (tokens.length === 0) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }

      // Mark token as used
      await pool.execute(`UPDATE user_tokens SET used = TRUE WHERE token = ?`, [
        code,
      ]);

      // Enable 2FA for the user
      await pool.execute(
        `UPDATE user_data SET is2faEnabled = 1, last2faVerifiedAt = NOW() WHERE userId = ?`,
        [req.user.userId]
      );

      return res.json({ message: "2FA enabled successfully!" });
    } catch (error) {
      console.error("Verify 2FA code error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  router.post("/disable-2fa", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      await pool.execute(
        `UPDATE user_data SET is2faEnabled = 0, last2faVerified = NULL WHERE userId = ?`,
        [req.user.userId]
      );

      return res.json({ message: "2FA disabled successfully" });
    } catch (error) {
      console.error("Disable 2FA error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // UPDATE user — admin only
  router.put("/users/:userId", async (req, res) => {
    if (req.user?.role !== "administrator") {
      return res.status(403).json({ error: "Admin only" });
    }
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      username,
      email,
      role,
      accountStatus,
      address,
    } = req.body;

    try {
      await pool.execute(
        `UPDATE user_data 
       SET firstName = ?, lastName = ?, username = ?, email = ?, 
           role = ?, accountStatus = ?, address = ?
       WHERE userId = ?`,
        [
          firstName,
          lastName,
          username,
          email,
          role,
          accountStatus,
          address,
          userId,
        ]
      );
      res.json({ message: "User updated" });
    } catch (err) {
      console.error("PUT /users error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  // GET all users — admin only
  // Keep only this route and expand it:
  router.get("/users", async (req, res) => {
    if (req.user?.role !== "administrator") {
      return res.status(403).json({ error: "Admin only" });
    }
    try {
      const [rows] = await pool.execute(
        `SELECT userId, username, firstName, lastName, email, role, 
                is2faEnabled, emailVerified, accountStatus, address, 
                createdAt, updatedAt, lastLoginAt, lastPasswordChange, 
                last2faVerifiedAt, loginCount, failedLoginCount
        FROM user_data ORDER BY createdAt DESC`
      );
      res.json(rows);
    } catch (err) {
      console.error("GET /users error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Add these routes before the "return router;" statement in your auth routes file:

  // GET all orders — admin only
  router.get("/orders", async (req, res) => {
    if (req.user?.role !== "administrator") {
      return res.status(403).json({ error: "Admin only" });
    }
    try {
      const [rows] = await pool.execute(
        `SELECT orderId, userId, items, totalAmount, status, 
              paymentMethod, shippingAddress, created_at, updated_at
       FROM order_data ORDER BY created_at DESC`
      );
      res.json(rows);
    } catch (err) {
      console.error("GET /orders error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // UPDATE order status — admin only
  // UPDATE order (status and/or address) — admin only
  router.put("/orders/:orderId", async (req, res) => {
    if (req.user?.role !== "administrator")
      return res.status(403).json({ error: "Admin only" });

    const { status, shippingAddress } = req.body;

    try {
      // Build dynamic query based on what fields are provided
      if (status !== undefined && shippingAddress !== undefined) {
        // Both fields provided
        await pool.execute(
          `UPDATE order_data SET status = ?, shippingAddress = ?, updated_at = NOW() WHERE orderId = ?`,
          [status, shippingAddress, req.params.orderId]
        );
      } else if (status !== undefined) {
        // Only status provided
        await pool.execute(
          `UPDATE order_data SET status = ?, updated_at = NOW() WHERE orderId = ?`,
          [status, req.params.orderId]
        );
      } else if (shippingAddress !== undefined) {
        // Only address provided
        await pool.execute(
          `UPDATE order_data SET shippingAddress = ?, updated_at = NOW() WHERE orderId = ?`,
          [shippingAddress, req.params.orderId]
        );
      } else {
        return res.status(400).json({ error: "No fields to update" });
      }

      res.json({ message: "Order updated successfully" });
    } catch (err) {
      console.error("PUT /orders error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  return router;
}

export default createAuthRoutes;

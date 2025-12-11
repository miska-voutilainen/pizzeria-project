import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import {
  sendVerificationEmail,
  send2FAEmail,
  sendPasswordResetEmail,
} from "../services/email.service.js";
import {
  createToken,
  validateToken,
  markTokenUsed,
} from "../services/token.service.js";
import { handleFailedLogin } from "../services/user.service.js";

export default function createAuthRouter(
  pool,
  { createSession, destroySession, destroyAllSessions }
) {
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
        return res
          .status(400)
          .json({ message: "Validation failed", errors: errors.array() });
      }

      const { username, password } = req.body;

      try {
        const [rows] = await pool.execute(
          "SELECT * FROM user_data WHERE username = ?",
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

        if (user.role === "administrator" || user.is2faEnabled) {
          const code = Math.floor(1000 + Math.random() * 9000).toString(); // Exactly 4 digits: 1000–9999
          const now = new Date();
          const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

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
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  router.post("/verify-login-2fa", async (req, res) => {
    const { code, userId } = req.body;
    if (!code || !userId) {
      return res.status(400).json({ message: "Code and user ID required" });
    }

    try {
      const [tokens] = await pool.execute(
        `SELECT token FROM user_tokens
          WHERE token = ? AND userId = ? AND type = '2fa-login'
          AND used = FALSE AND expiresAt > NOW()`,
        [code, userId]
      );

      if (tokens.length === 0) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }

      await pool.execute(`UPDATE user_tokens SET used = TRUE WHERE token = ?`, [
        code,
      ]);

      const [users] = await pool.execute(
        "SELECT * FROM user_data WHERE userId = ?",
        [userId]
      );
      const user = users[0];
      if (!user) return res.status(404).json({ message: "User not found" });

      await pool.execute(
        `UPDATE user_data
          SET lastLoginAt = NOW(),
            accountStatus = 'active',
            failedLoginCount = 0,
            loginCount = loginCount + 1
        WHERE userId = ?`,
        [user.userId]
      );

      await pool.execute(`DELETE FROM user_sessions WHERE userId = ?`, [
        user.userId,
      ]);
      await createSession(user.userId, req, res);

      res.json({ message: "Login successful" });
    } catch (error) {
      console.error("2FA verify error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post(
    "/register",
    [
      body("username").trim().isLength({ min: 3, max: 30 }).escape(),
      body("email").isEmail().normalizeEmail(),
      body("password").isLength({ min: 6 }),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ message: errors.array()[0].msg });

      const { username, email, password } = req.body;

      try {
        const [existing] = await pool.execute(
          "SELECT username FROM user_data WHERE username = ? OR email = ?",
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

        // Send verification email in the background (non-blocking)
        (async () => {
          try {
            const token = await createToken(
              pool,
              userId,
              "verify-email",
              24,
              req
            );
            const link = `${
              process.env.SERVER_URI || "http://localhost:3001"
            }/api/auth/verify-email/${token}`;
            await sendVerificationEmail(email, username, link);
          } catch (err) {
            console.error("Failed to send verification email:", err);
          }
        })();

        res.status(201).json({
          message: "Registration successful! You can now log in.",
        });
      } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  router.post("/send-verify-link", async (req, res) => {
    const { username } = req.body;
    try {
      const [rows] = await pool.execute(
        "SELECT userId, email, emailVerified FROM user_data WHERE username = ?",
        [username]
      );
      const user = rows[0];
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.emailVerified)
        return res.json({ message: "Email already verified" });

      const token = await createToken(
        pool,
        user.userId,
        "verify-email",
        24,
        req
      );
      const link = `${
        process.env.SERVER_URI || "http://localhost:3001"
      }/api/auth/verify-email/${token}`;

      await sendVerificationEmail(user.email, username, link);
      res.json({ message: "Verification email sent!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  router.get("/verify-email/:token", async (req, res) => {
    const { token } = req.params;
    try {
      const tokenDoc = await validateToken(pool, token, "verify-email");
      if (!tokenDoc)
        return res.status(400).json({ message: "Invalid or expired link" });

      const [users] = await pool.execute(
        "SELECT emailVerified FROM user_data WHERE userId = ?",
        [tokenDoc.userId]
      );
      if (users[0]?.emailVerified) {
        await markTokenUsed(pool, token);
        return res.json({ message: "Email already verified" });
      }

      await pool.execute(
        `UPDATE user_data SET emailVerified = TRUE, updatedAt = NOW() WHERE userId = ?`,
        [tokenDoc.userId]
      );
      await markTokenUsed(pool, token);

      res.json({ message: "Email verified! You can now log in." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post("/send-reset-link", async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    try {
      const [rows] = await pool.execute(
        "SELECT userId, username, email FROM user_data WHERE email = ?",
        [email]
      );
      const user = rows[0];

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.email) {
        console.error("User email is null/undefined:", user);
        return res
          .status(400)
          .json({ message: "User email not found in database" });
      }

      const token = await createToken(pool, user.userId, "reset", 1, req);
      const resetLink = `${
        process.env.SERVER_URI || "http://localhost:3001"
      }/api/auth/reset-password/${token}`;

      await sendPasswordResetEmail(user.email, user.username, resetLink);
      res.json({ message: "Password reset link sent to your email!" });
    } catch (error) {
      console.error("Send reset link error:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  router.get("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    try {
      const tokenDoc = await validateToken(pool, token, "reset");
      res.json({ valid: !!tokenDoc });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
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
      if (!tokenDoc)
        return res.status(400).json({ message: "Invalid or expired token" });

      const passwordHash = await bcrypt.hash(password, 14);

      await pool.execute(
        `UPDATE user_data
          SET passwordHash = ?, lastPasswordChange = NOW(), accountStatus = 'active', failedLoginCount = 0
          WHERE userId = ?`,
        [passwordHash, tokenDoc.userId]
      );

      await markTokenUsed(pool, token);
      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.get("/unlock-account/:token", async (req, res) => {
    const { token } = req.params;
    try {
      const tokenDoc = await validateToken(pool, token, "unlock");
      if (!tokenDoc)
        return res.status(400).json({ message: "Invalid or expired token" });

      await pool.execute(
        `UPDATE user_data SET accountStatus = 'active', failedLoginCount = 0 WHERE userId = ?`,
        [tokenDoc.userId]
      );
      await markTokenUsed(pool, token);

      res.json({ message: "Account unlocked successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post("/send-2fa-code", async (req, res) => {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    const [users] = await pool.execute(
      "SELECT email, username, emailVerified FROM user_data WHERE userId = ?",
      [req.user.userId]
    );
    const user = users[0];
    if (!user.emailVerified)
      return res.status(400).json({ message: "Verify email first" });

    const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digits
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.execute(
      `INSERT INTO user_tokens (userId, token, type, createdAt, expiresAt, used, ipAddress, userAgent)
        VALUES (?, ?, '2fa-setup', NOW(), ?, FALSE, ?, ?)`,
      [
        req.user.userId,
        code,
        expiresAt,
        req.ip || "unknown",
        req.get("User-Agent") || "unknown",
      ]
    );

    await send2FAEmail(user.email, user.username, code);
    res.json({ message: "2FA code sent" });
  });

  router.post("/verify-2fa-code", async (req, res) => {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "Code required" });

    const [tokens] = await pool.execute(
      `SELECT token FROM user_tokens
        WHERE token = ? AND userId = ? AND type = '2fa-setup'
        AND used = FALSE AND expiresAt > NOW()`,
      [code, req.user.userId]
    );

    if (tokens.length === 0)
      return res.status(400).json({ message: "Invalid or expired code" });

    await pool.execute(`UPDATE user_tokens SET used = TRUE WHERE token = ?`, [
      code,
    ]);
    await pool.execute(
      `UPDATE user_data SET is2faEnabled = 1, last2faVerifiedAt = NOW() WHERE userId = ?`,
      [req.user.userId]
    );

    res.json({ message: "2FA enabled successfully!" });
  });

  router.post("/disable-2fa", async (req, res) => {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });
    await pool.execute(
      `UPDATE user_data SET is2faEnabled = 0 WHERE userId = ?`,
      [req.user.userId]
    );
    res.json({ message: "2FA disabled" });
  });

  router.post("/logout", destroySession, (req, res) => {
    res.json({ message: "Logged out successfully" });
  });

  router.get("/check", async (req, res) => {
    if (!req.user) {
      return res.json({ authenticated: false });
    }

    try {
      // 1. Fetch user data
      const [userRows] = await pool.execute(
        `SELECT 
         userId,
         username,
         email,
         emailVerified,
         is2faEnabled AS twoFactorEnabled,
         role,
         firstName,
         lastName,
         address,
         createdAt,
         DATE_FORMAT(createdAt, '%Y-%m-%dT%H:%i:%s') AS createdAt
       FROM user_data 
       WHERE userId = ?`,
        [req.user.userId]
      );

      if (userRows.length === 0) {
        return res.json({ authenticated: false });
      }

      const dbUser = userRows[0];

      // Parse address
      let addressObj = null;
      if (dbUser.address) {
        try {
          addressObj =
            typeof dbUser.address === "string"
              ? JSON.parse(dbUser.address)
              : dbUser.address;
        } catch (e) {
          addressObj = null;
        }
      }

      // 2. Fetch orders — THIS FIXES EVERYTHING
      const [orderRows] = await pool.execute(
        `SELECT 
         orderId,
         items,
         shippingAddress,
         totalAmount,
         status,
         paymentMethod,
         deliveryType,
         customerName,
         customerPhone,
         created_at AS createdAt
       FROM order_data 
       WHERE userId = ?
       ORDER BY created_at DESC`,
        [req.user.userId]
      );

      const orders = orderRows.map((row) => {
        let items = [];
        let shippingAddress = null;

        // Fix double-encoded JSON (your real problem)
        const safeParse = (field) => {
          if (!field) return null;
          try {
            let parsed = typeof field === "string" ? JSON.parse(field) : field;
            // If it's still a string → it's double-encoded → parse again
            if (typeof parsed === "string") {
              parsed = JSON.parse(parsed);
            }
            return parsed;
          } catch (e) {
            console.warn("Could not parse JSON field:", field);
            return null;
          }
        };

        items = safeParse(row.items) || [];
        shippingAddress = safeParse(row.shippingAddress);

        return {
          orderId: row.orderId,
          totalAmount: row.totalAmount,
          status: row.status,
          paymentMethod: row.paymentMethod,
          deliveryType: row.deliveryType,
          customerName: row.customerName,
          customerPhone: row.customerPhone,
          createdAt: row.createdAt,
          items,
          shippingAddress,
        };
      });

      res.json({
        authenticated: true,
        user: {
          userId: dbUser.userId,
          username: dbUser.username,
          email: dbUser.email || "",
          emailVerified: !!dbUser.emailVerified,
          twoFactorEnabled: !!dbUser.twoFactorEnabled,
          role: dbUser.role || "user",
          firstName: dbUser.firstName || "",
          lastName: dbUser.lastName || "",
          address: addressObj,
          createdAt: dbUser.createdAtFormatted || dbUser.createdAt || null,
          orders,
        },
      });
    } catch (error) {
      console.error("Error in /auth/check:", error);
      res.json({
        authenticated: true,
        user: {
          userId: req.user.userId,
          username: req.user.username || "User",
          firstName: "",
          lastName: "",
          address: null,
          orders: [],
        },
      });
    }
  });

  return router;
}

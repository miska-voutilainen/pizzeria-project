import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import {
  sendVerificationEmail,
  send2FAEmail,
  sendPasswordResetEmail,
  sendEmailChangeLink,
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
            const link = `${process.env.SERVER_URI}/api/auth/verify-email/${token}`;
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
      const link = `${process.env.SERVER_URI}/api/auth/verify-email/${token}`;

      await sendVerificationEmail(user.email, username, link);
      res.json({ message: "Verification email sent!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  router.post("/update-address", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { street, postalCode, city } = req.body;

    if (!street || !postalCode || !city) {
      return res
        .status(400)
        .json({ message: "All address fields are required" });
    }

    try {
      await pool.execute(
        `UPDATE user_data 
       SET address = JSON_SET(IFNULL(address, '{}'), '$.street', ?, '$.postalCode', ?, '$.city', ?)
       WHERE userId = ?`,
        [street, postalCode, city, req.user.userId]
      );

      res.json({ message: "Address updated successfully" });
    } catch (error) {
      console.error("Update address error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post("/update-name", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res
        .status(400)
        .json({ message: "First and last name are required" });
    }

    try {
      await pool.execute(
        "UPDATE user_data SET firstName = ?, lastName = ? WHERE userId = ?",
        [firstName.trim(), lastName.trim(), req.user.userId]
      );

      res.json({ message: "Name updated successfully" });
    } catch (error) {
      console.error("Update name error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Verify token (GET)
  router.get("/verify-email-token/:token", async (req, res) => {
    const { token } = req.params;
    try {
      const tokenDoc = await validateToken(pool, token, "change-email");
      if (!tokenDoc) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      res.json({ message: "Token valid" });
    } catch (err) {
      res.status(400).json({ message: "Invalid token" });
    }
  });

  // Change email (POST)
  router.post("/change-email/:token", async (req, res) => {
    const { token } = req.params;
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Valid email required" });
    }

    try {
      const tokenDoc = await validateToken(pool, token, "change-email");
      if (!tokenDoc) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Check if email already exists
      const [existing] = await pool.execute(
        "SELECT userId FROM user_data WHERE email = ? AND userId != ?",
        [email, tokenDoc.userId]
      );
      if (existing.length > 0) {
        return res.status(409).json({ message: "Email already in use" });
      }

      await pool.execute(
        "UPDATE user_data SET email = ?, emailVerified = 0 WHERE userId = ?",
        [email, tokenDoc.userId]
      );

      await markTokenUsed(pool, token);

      res.json({ message: "Email changed successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
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

      // ← FIXED: Use CLIENT_URI, not SERVER_URI
      const resetLink = `${process.env.CLIENT_URI}/reset-password/${token}`;

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

  router.post("/send-change-email-link", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!req.user.email || req.user.email.trim() === "") {
      console.error("User has no email:", req.user);
      return res
        .status(400)
        .json({ message: "No email address associated with your account" });
    }

    try {
      const token = await createToken(
        pool,
        req.user.userId,
        "change-email",
        1,
        req
      ); // 1 hour

      const changeLink = `${process.env.CLIENT_URI}/change-email/${token}`;

      await sendEmailChangeLink(
        req.user.email.trim(),
        req.user.username || "User",
        changeLink
      );

      res.json({ message: "Change email link sent to your current email!" });
    } catch (error) {
      console.error("Send email change link error:", error);
      res.status(500).json({ message: "Failed to send link" });
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

  router.post("/disable-2fa-with-code", async (req, res) => {
    console.log("HIT /disable-2fa-with-code"); // ← ADD THIS LOG

    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { code } = req.body;
    console.log("Received code:", code); // ← ADD THIS LOG

    if (!code) {
      return res.status(400).json({ message: "Code required" });
    }

    try {
      const [tokens] = await pool.execute(
        `SELECT token FROM user_tokens
       WHERE token = ? AND userId = ? AND type IN ('2fa-setup', '2fa-login')
       AND used = FALSE AND expiresAt > NOW()`,
        [code, req.user.userId]
      );

      if (tokens.length === 0) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }

      await pool.execute(`UPDATE user_tokens SET used = TRUE WHERE token = ?`, [
        code,
      ]);

      await pool.execute(
        `UPDATE user_data SET is2faEnabled = 0 WHERE userId = ?`,
        [req.user.userId]
      );

      console.log("2FA disabled for user:", req.user.userId); // ← LOG SUCCESS
      return res.json({ message: "2FA disabled successfully!" });
    } catch (error) {
      console.error("Disable 2FA error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  router.post("/logout", destroySession, async (req, res) => {
    try {
      // destroySession middleware already cleared the session
      // Optional: Destroy ALL user sessions for extra security (recommended for logout)
      if (req.user) {
        await destroyAllSessions(req.user.userId); // Clears all sessions for this user
      }

      // Clear the session cookie explicitly (good practice)
      res.clearCookie("connect.sid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure in production
        sameSite: "lax",
      });

      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({ message: "Logout failed" });
    }
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

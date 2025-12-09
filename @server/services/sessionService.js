// services/sessionService.js
import { randomBytes } from "crypto";

const SESSION_COOKIE_NAME = "sid";
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function createSessionService(pool) {
  const sessionMiddleware = async (req, res, next) => {
    const sessionToken = req.cookies[SESSION_COOKIE_NAME];

    if (!sessionToken) {
      req.user = null;
      req.session = null;
      return next();
    }

    try {
      const [rows] = await pool.execute(
        `SELECT
            us.*,
            u.userId,
            u.username,
            u.role,
            u.is2faEnabled,
            u.emailVerified
          FROM user_sessions us
          JOIN user_data u ON us.userId = u.userId
          WHERE us.sessionToken = ?
            AND us.isActive = TRUE
            AND us.expiresAt > NOW()
          LIMIT 1`,
        [sessionToken]
      );

      if (rows.length === 0) {
        res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
        req.user = null;
        req.session = null;
        return next();
      }

      const session = rows[0];

      // THIS IS THE ONLY LINE I CHANGED — now req.user.role works everywhere
      req.user = {
        id: session.userId,
        userId: session.userId,
        username: session.username,
        role: session.role, // ← now guaranteed to exist
        is2faEnabled: session.is2faEnabled,
        emailVerified: session.emailVerified,
      };

      req.session = session;

      // Extend session expiry
      await pool.execute(
        `UPDATE user_sessions
         SET expiresAt = DATE_ADD(NOW(), INTERVAL 1 DAY)
         WHERE sessionToken = ?`,
        [sessionToken]
      );

      next();
    } catch (error) {
      console.error("Session middleware error:", error);
      req.user = null;
      req.session = null;
      next();
    }
  };

  const createSession = async (userId, req, res, expiresInDays = 1) => {
    const sessionToken = randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + expiresInDays * SESSION_MAX_AGE_MS);

    await pool.execute(
      `INSERT INTO user_sessions
         (userId, sessionToken, loginAt, expiresAt, ipAddress, userAgent, isActive)
       VALUES (?, ?, NOW(), ?, ?, ?, TRUE)`,
      [
        userId,
        sessionToken,
        expiresAt,
        req.ip || "unknown",
        req.get("User-Agent") || "unknown",
      ]
    );

    res.cookie(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresInDays * SESSION_MAX_AGE_MS,
      path: "/",
      // THIS LINE IS CRITICAL for subdomains (localhost + future admin.pizzeria-web.com)
      domain:
        process.env.NODE_ENV === "production"
          ? ".pizzeria-web.com"
          : ".localhost",
    });

    return sessionToken;
  };

  const destroySession = async (req, res) => {
    const token = req.cookies[SESSION_COOKIE_NAME];
    if (token) {
      await pool.execute(
        `UPDATE user_sessions SET isActive = FALSE, logoutAt = NOW() WHERE sessionToken = ?`,
        [token]
      );
    }
    res.clearCookie(SESSION_COOKIE_NAME, { path: "/", domain: ".localhost" });
  };

  const destroyAllSessions = async (userId) => {
    await pool.execute(
      `UPDATE user_sessions SET isActive = FALSE, logoutAt = NOW() WHERE userId = ?`,
      [userId]
    );
  };

  return {
    sessionMiddleware,
    createSession,
    destroySession,
    destroyAllSessions,
  };
}

export default createSessionService;

import { randomBytes } from "crypto";

const SESSION_COOKIE_NAME = "sid";
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

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
        `SELECT us.*, u.id AS userId, u.role
         FROM user_sessions us
         JOIN users u ON us.userId = u.id
         WHERE us.sessionToken = ?
           AND us.isActive = TRUE
           AND us.expiresAt > NOW()
         LIMIT 1`,
        [sessionToken]
      );

      if (rows.length === 0) {
        res.clearCookie(SESSION_COOKIE_NAME);
        req.user = null;
        req.session = null;
        return next();
      }

      const session = rows[0];
      req.user = { id: session.userId, role: session.role };
      req.session = session;

      await pool.execute(
        `UPDATE user_sessions SET expiresAt = DATE_ADD(NOW(), INTERVAL 1 DAY) WHERE sessionToken = ?`,
        [sessionToken]
      );

      next();
    } catch (err) {
      console.error("Session middleware error:", err);
      req.user = null;
      req.session = null;
      next();
    }
  };

  const createSession = async (userId, req, res, expiresInDays = 1) => {
    const sessionToken = randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    await pool.execute(
      `INSERT INTO user_sessions
         (_id, userId, sessionToken, loginAt, expiresAt, ipAddress, userAgent, isActive)
       VALUES (UUID(), ?, ?, NOW(), ?, ?, ?, TRUE)`,
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
      maxAge: expiresInDays * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return sessionToken;
  };

  const destroySession = async (req, res) => {
    const token = req.cookies[SESSION_COOKIE_NAME];
    if (token) {
      await pool.execute(`UPDATE user_sessions SET isActive = FALSE WHERE sessionToken = ?`, [token]);
    }
    res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  };

  const destroyAllSessions = async (userId) => {
    await pool.execute(`UPDATE user_sessions SET isActive = FALSE WHERE userId = ?`, [userId]);
  };

  return {
    sessionMiddleware,
    createSession,
    destroySession,
    destroyAllSessions,
  };
}

export default createSessionService;
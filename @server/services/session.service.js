import { randomBytes } from "crypto";

const COOKIE_NAME = "sid";
const MAX_AGE = 24 * 60 * 60 * 1000; // 24h

export default function createSessionService(pool) {
  const sessionMiddleware = async (req, res, next) => {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return next();

    try {
      const [rows] = await pool.execute(
        `SELECT us.*, u.userId, u.username, u.role, u.is2faEnabled, u.emailVerified, u.email
         FROM user_sessions us
         JOIN user_data u ON us.userId = u.userId
         WHERE us.sessionToken = ? AND us.isActive = TRUE AND us.expiresAt > NOW()`,
        [token]
      );

      if (rows[0]) {
        req.user = {
          userId: rows[0].userId,
          username: rows[0].username,
          role: rows[0].role,
          is2faEnabled: !!rows[0].is2faEnabled,
          emailVerified: !!rows[0].emailVerified,
          email: rows[0].email || null,
        };

        await pool.execute(
          `UPDATE user_sessions SET expiresAt = DATE_ADD(NOW(), INTERVAL 1 DAY) WHERE sessionToken = ?`,
          [token]
        );
      }
    } catch (e) {
      console.error(e);
    }
    next();
  };

  const createSession = async (userId, req, res) => {
    const token = randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + MAX_AGE);

    await pool.execute(
      `INSERT INTO user_sessions (userId, sessionToken, loginAt, expiresAt, ipAddress, userAgent, isActive)
     VALUES (?, ?, NOW(), ?, ?, ?, TRUE)
     ON DUPLICATE KEY UPDATE 
       sessionToken = VALUES(sessionToken),
       expiresAt = VALUES(expiresAt),
       loginAt = NOW(),
       isActive = TRUE`,
      [
        userId,
        token,
        expiresAt,
        req.ip || "unknown",
        req.get("User-Agent") || "unknown",
      ]
    );

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });
  };

  const destroySession = async (req, res) => {
    const token = req.cookies[COOKIE_NAME];
    if (token) {
      await pool.execute(
        `UPDATE user_sessions SET isActive = FALSE WHERE sessionToken = ?`,
        [token]
      );
    }
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  };
  const destroyAllSessions = async (userId) => {
    await pool.execute(
      `UPDATE user_sessions SET isActive = FALSE WHERE userId = ?`,
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

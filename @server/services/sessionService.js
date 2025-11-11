// services/sessionService.js
import session from 'express-session';
import MariaDBStore from 'express-session-mariadb-store';
import mysql from 'mysql';

function createSessionService(pool) {
  // 1. Create mysql (callback-style) pool for the store
  const sessionPool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || '',
    connectionLimit: 5,
  });

  // 2. Create the store instance
  const store = new MariaDBStore({
    pool: sessionPool,           // Correct: pass the pool
    table: 'express_sessions',
    expiration: 86400000,        // 24 hours in ms
  });

  // 3. Session middleware
  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store,                       // Correct: pass the store instance
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  });

  // 4. Audit log (uses your mysql2/promise pool)
  async function createSession(userId, req, res, expiresInHours = 24) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
    const sessionToken = req.sessionID;

    const sql = `
      INSERT INTO userSessions
        (_id, userId, loginAt, expiresAt, ipAddress, userAgent, isActive, sessionToken)
      VALUES (UUID(), ?, ?, ?, ?, ?, TRUE, ?)
    `;

    await pool.execute(sql, [
      userId,
      now,
      expiresAt,
      req.ip || 'unknown',
      req.get('User-Agent') || 'unknown',
      sessionToken,
    ]);

    return sessionToken;
  }

  return { sessionMiddleware, createSession };
}

export default createSessionService;
import session from 'express-session';

function createSessionService(db) {
  const SESSIONS = db.collection('userSessions');
  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || '',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  });
  async function createSession(userId, req, res, expiresInHours = 24) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
    const sessionToken = req.sessionID;
    const sessionDoc = {
      userId,
      loginAt: now,
      logoutAt: null,
      expiresAt,
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      isActive: true,
      sessionToken,
    };
    await SESSIONS.insertOne(sessionDoc);
    return sessionToken;
  }
  return { sessionMiddleware, createSession };
}

export default createSessionService;
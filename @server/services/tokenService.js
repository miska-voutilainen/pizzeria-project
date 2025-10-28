import { randomUUID } from 'crypto';

async function createToken(db, userId, type, expiresInHours = 24) {
  const now = new Date();
  const token = randomUUID();
  const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
  const tokenDoc = {
    userId,
    token,
    type,
    createdAt: now,
    expiresAt,
    used: false,
    ipAddress: null,
    userAgent: null,
  };
  await db.collection('userTokens').insertOne(tokenDoc);
  return token;
}

async function validateToken(db, token, type) {
  const tokenDoc = await db.collection('userTokens').findOne({ token, used: false, type });
  if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
    return null;
  }
  return tokenDoc;
}

async function markTokenUsed(db, tokenId) {
  await db.collection('userTokens').updateOne({ _id: tokenId }, { $set: { used: true } });
}

export { createToken, validateToken, markTokenUsed };
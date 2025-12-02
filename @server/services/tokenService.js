import { randomBytes } from "crypto";

export async function createToken(pool, userId, type, expiresInHours = 24) {
  const token = randomBytes(48).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);

  const sql = `
    INSERT INTO user_tokens
      (_id, userId, token, type, createdAt, expiresAt, used)
    VALUES (UUID(), ?, ?, ?, ?, ?, FALSE)
  `;
  await pool.execute(sql, [userId, token, type, now, expiresAt]);
  return token;
}

export async function validateToken(pool, token, type) {
  const [rows] = await pool.execute(
    `SELECT * FROM user_tokens
     WHERE token = ? AND type = ? AND used = FALSE AND expiresAt > NOW()`,
    [token, type]
  );
  return rows[0] || null;
}

export async function markTokenUsed(pool, tokenId) {
  await pool.execute(`UPDATE user_tokens SET used = TRUE WHERE _id = ?`, [
    tokenId,
  ]);
}

import { randomBytes } from "crypto";

export const createToken = async (
  pool,
  userId,
  type,
  hours = 24,
  req = null
) => {
  const token = randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + hours * 3600000);

  await pool.execute(
    `INSERT INTO user_tokens
     (userId, token, type, createdAt, expiresAt, used, ipAddress, userAgent)
     VALUES (?, ?, ?, NOW(), ?, FALSE, ?, ?)`,
    [
      userId,
      token,
      type,
      expiresAt,
      req?.ip || "system",
      req?.get("User-Agent") || "system",
    ]
  );
  return token;
};

export const validateToken = async (pool, token, type) => {
  const [rows] = await pool.execute(
    `SELECT * FROM user_tokens
     WHERE token = ? AND type = ? AND used = FALSE AND expiresAt > NOW()`,
    [token, type]
  );
  return rows[0] || null;
};

export const markTokenUsed = async (pool, token) => {
  await pool.execute(`UPDATE user_tokens SET used = TRUE WHERE token = ?`, [
    token,
  ]);
};

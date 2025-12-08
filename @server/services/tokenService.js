import { randomBytes } from "crypto";

export async function createToken(
  pool,
  userId,
  type,
  expiresInHours = 24,
  req = null
) {
  const token = randomBytes(48).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);

  const sql = `
    INSERT INTO user_tokens 
      (userId, token, type, createdAt, expiresAt, used, ipAddress, userAgent)
    VALUES (?, ?, ?, ?, ?, FALSE, ?, ?)
  `;

  const ipAddress = req ? req.ip || "unknown" : "system";
  const userAgent = req ? req.get("User-Agent") || "unknown" : "system";

  await pool.execute(sql, [
    userId,
    token,
    type,
    now,
    expiresAt,
    ipAddress,
    userAgent,
  ]);

  return token;
}

export async function validateToken(pool, token, type) {
  const [rows] = await pool.execute(
    `SELECT * FROM user_tokens
     WHERE token = ?
       AND type = ?
       AND used = FALSE
       AND expiresAt > NOW()
     LIMIT 1`,
    [token, type]
  );

  return rows[0] || null;
}

export async function markTokenUsed(pool, token) {
  await pool.execute(
    `UPDATE user_tokens 
     SET used = TRUE 
     WHERE token = ?`,
    [token]
  );
}

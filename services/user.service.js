import { createToken } from "./token.service.js";
import { sendUnlockEmail } from "./email.service.js";

export const handleFailedLogin = async (pool, username, req) => {
  const [rows] = await pool.execute(
    `SELECT userId, failedLoginCount, email, username FROM user_data WHERE username = ?`,
    [username]
  );
  const user = rows[0];
  if (!user) return;

  const count = (user.failedLoginCount || 0) + 1;

  if (count >= 5) {
    await pool.execute(
      `UPDATE user_data SET accountStatus = 'locked', failedLoginCount = ? WHERE username = ?`,
      [count, username]
    );

    const unlockToken = await createToken(pool, user.userId, "unlock", 24, req);
    const resetToken = await createToken(pool, user.userId, "reset", 24, req);

    const unlockLink = `${process.env.SERVER_URI}/api/auth/unlock-account/${unlockToken}`;
    // TODO: Email redirects to wrong URI: http://localhost:3001/api/auth/reset-password/:token.
    const resetLink = `${process.env.CLIENT_URI}/reset-password/${resetToken}`;

    await sendUnlockEmail(user.email, user.username, unlockLink, resetLink);
  } else {
    await pool.execute(
      `UPDATE user_data SET failedLoginCount = ? WHERE username = ?`,
      [count, username]
    );
  }
};

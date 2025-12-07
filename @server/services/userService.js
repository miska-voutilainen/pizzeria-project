import { createToken } from "./tokenService.js";
import { sendUnlockEmail } from "./emailService.js";

export async function handleFailedLogin(pool, username) {
  const [rows] = await pool.execute(
    `SELECT userId, failedLoginCount, email, username 
     FROM user_data 
     WHERE username = ?`,
    [username]
  );

  const user = rows[0];
  if (!user) return;

  const newFailedCount = (user.failedLoginCount || 0) + 1;

  if (newFailedCount >= 5) {
    await pool.execute(
      `UPDATE user_data 
       SET accountStatus = 'locked', 
           failedLoginCount = ? 
       WHERE username = ?`,
      [newFailedCount, username]
    );

    const unlockToken = await createToken(pool, user.userId, "unlock");
    const resetToken = await createToken(pool, user.userId, "reset");

    const unlockLink = `http://localhost:3001/api/unlock-account/${unlockToken}`;
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    try {
      await sendUnlockEmail(user.email, user.username, unlockLink, resetLink);
    } catch (error) {
      console.error("Failed to send account unlock email:", error);
    }
  } else {
    await pool.execute(
      `UPDATE user_data 
       SET failedLoginCount = ? 
       WHERE username = ?`,
      [newFailedCount, username]
    );
  }
}

// userService.js
import { createToken } from './tokenService.js';
import { sendUnlockEmail } from './emailService.js';

export async function handleFailedLogin(pool, username) {
  const [users] = await pool.execute(
    `SELECT userId, failedLoginCount, email, username FROM userData WHERE username = ?`,
    [username]
  );
  const user = users[0];
  if (!user) return;

  const newFailedCount = (user.failedLoginCount || 0) + 1;

  if (newFailedCount >= 5) {
    // lock + send e-mail
    await pool.execute(
      `UPDATE userData SET accountStatus = 'locked', failedLoginCount = ? WHERE username = ?`,
      [newFailedCount, username]
    );

    const unlockToken = await createToken(pool, user.userId, 'unlock');
    const resetToken   = await createToken(pool, user.userId, 'reset');

    const unlockLink = `http://localhost:3001/api/unlock-account/${unlockToken}`;
    const resetLink  = `http://localhost:3000/reset-password/${resetToken}`;

    try {
      await sendUnlockEmail(user.email, user.username, unlockLink, resetLink);
    } catch (e) {
      console.error('Failed to send unlock e-mail', e);
    }
  } else {
    await pool.execute(
      `UPDATE userData SET failedLoginCount = ? WHERE username = ?`,
      [newFailedCount, username]
    );
  }
}
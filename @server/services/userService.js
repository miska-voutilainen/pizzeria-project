import { createToken } from './tokenService.js';
import { sendUnlockEmail } from './emailService.js';

async function handleFailedLogin(db, username) {
  const userDataCollection = db.collection('userData');
  const user = await userDataCollection.findOne({ username });
  if (user) {
    const newFailedCount = (user.failedLoginCount || 0) + 1;
    if (newFailedCount >= 5) {
      await userDataCollection.updateOne(
        { username },
        { $set: { accountStatus: 'locked', failedLoginCount: newFailedCount } }
      );
      const unlockToken = await createToken(db, user.userId, 'unlock');
      const resetToken = await createToken(db, user.userId, 'reset');
      const unlockLink = `http://localhost:3001/api/unlock-account/${unlockToken}`;
      const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
      try {
        await sendUnlockEmail(user.email, user.username, unlockLink, resetLink);
      } catch (emailError) {
        console.error('Failed to send unlock/reset email for username:', username, emailError);
      }
    } else {
      await userDataCollection.updateOne(
        { username },
        { $set: { failedLoginCount: newFailedCount } }
      );
    }
  }
}

export { handleFailedLogin };
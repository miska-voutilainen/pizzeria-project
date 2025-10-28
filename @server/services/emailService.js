import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_SECRET,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  }
});

async function sendUnlockEmail(email, username, unlockLink, resetLink) {
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: 'Account Actions Required',
    text: `Account Actions Required
Your account (${username}) has been locked due to multiple failed login attempts.
Unlock Your Account
Click the link below to unlock your account:
${unlockLink}
Alternatively, Reset Your Password
Click the link below to reset your password:
${resetLink}
Both links will expire in 24 hours.`,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending unlock email:', error);
    throw error;
  }
}

async function sendVerificationEmail(email, username, verifyLink) {
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: 'Verify Your Email Address',
    text: `Hi ${username},
Welcome! Please verify your email by clicking the link below:
${verifyLink}
This link expires in 15 minutes.
If you didn't sign up, you can ignore this email.
Thanks!`,
    html: `<p>Hi <strong>${username}</strong>,</p>
           <p>Welcome! Please verify your email by clicking the link below:</p>
           <p><a href="${verifyLink}" style="color: #007bff; text-decoration: underline;">Verify Email</a></p>
           <p>This link expires in <strong>15 minutes</strong>.</p>
           <p>If you didn't sign up, you can ignore this email.</p>
           <p>Thanks!</p>`,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}

export { sendUnlockEmail, sendVerificationEmail };
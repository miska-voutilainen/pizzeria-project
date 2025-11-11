// services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.EMAIL_ADDRESS || !process.env.EMAIL_SECRET) {
    throw new Error('EMAIL_ADDRESS or EMAIL_SECRET not set in .env');
  }

  transporter = nodemailer.createTransport({  // ← Fixed: createTransport
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_SECRET, // ← Must be App Password
    },
  });

  try {
    await transporter.verify();
    console.log('SMTP connection verified');
  } catch (error) {
    console.error('SMTP verification failed:', error.message);
    throw error;
  }

  return transporter;
}

export async function sendVerificationEmail(email, username, verifyLink) {
  const mailOptions = {
    from: `"Pizzeria" <${process.env.EMAIL_ADDRESS}>`,
    to: email,
    subject: 'Verify Your Email Address',
    text: `Hi ${username},\n\nVerify your email: ${verifyLink}\n\nExpires in 15 minutes.`,
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #c62828;">Pizzeria</h2>
        <p>Hi <strong>${username}</strong>,</p>
        <p>Click below to verify your email:</p>
        <p style="text-align: center;">
          <a href="${verifyLink}" style="background:#c62828;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;">Verify Email</a>
        </p>
        <p><small>Link expires in <strong>15 minutes</strong>.</small></p>
        <hr>
        <small>&copy; Pizzeria 2025</small>
      </div>
    `,
  };

  try {
    const t = await getTransporter();
    const info = await t.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send verification email:', error.message);
    throw error;
  }
}

export async function sendUnlockEmail(email, username, unlockLink, resetLink) {
  const mailOptions = {
    from: `"Pizzeria" <${process.env.EMAIL_ADDRESS}>`,
    to: email,
    subject: 'Account Locked – Action Required',
    html: `
      <p>Your account <strong>${username}</strong> is locked.</p>
      <p><a href="${unlockLink}">Unlock Account</a> | <a href="${resetLink}">Reset Password</a></p>
      <p>Links expire in 24 hours.</p>
    `,
  };

  try {
    const t = await getTransporter();
    const info = await t.sendMail(mailOptions);
    console.log('Unlock email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send unlock email:', error.message);
    throw error;
  }
}
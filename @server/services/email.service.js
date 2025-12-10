import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (!process.env.EMAIL_ADDRESS || !process.env.EMAIL_SECRET) {
    throw new Error("Email credentials missing");
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_SECRET,
    },
    tls: { rejectUnauthorized: false },
  });

  await transporter.verify();
  return transporter;
};

export const sendVerificationEmail = async (email, username, verifyLink) => {
  const t = await getTransporter();
  await t.sendMail({
    from: `"Pizzeria" <${process.env.EMAIL_ADDRESS}>`,
    to: email,
    subject: "Verify Your Email",
    html: `<p>Hi ${username},</p><p>Click <a href="${verifyLink}">here</a> to verify your email. Expires in 15 min.</p>`,
  });
};

export const send2FAEmail = async (
  email,
  username,
  code,
  customHtml = null
) => {
  const t = await getTransporter();
  const html =
    customHtml ||
    `
    <h2>Your Code: <strong style="font-size:24px;color:#c62828">${code}</strong></h2>
    <p>Valid for 15 minutes.</p>
  `;
  await t.sendMail({
    from: `"Pizzeria" <${process.env.EMAIL_ADDRESS}>`,
    to: email,
    subject: customHtml ? "Your Coupon" : "2FA Code",
    html,
  });
};

export const sendUnlockEmail = async (
  email,
  username,
  unlockLink,
  resetLink
) => {
  const t = await getTransporter();
  await t.sendMail({
    from: `"Pizzeria" <${process.env.EMAIL_ADDRESS}>`,
    to: email,
    subject: "Account Locked",
    html: `<p>Hi ${username}, your account is locked.</p>
           <p><a href="${unlockLink}">Unlock</a> | <a href="${resetLink}">Reset Password</a></p>`,
  });
};

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
  if (!email || !email.trim()) {
    throw new Error("Email recipient is required");
  }
  const t = await getTransporter();
  await t.sendMail({
    from: `"Pizzeria" <${process.env.EMAIL_ADDRESS}>`,
    to: email.trim(),
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
  if (!email || !email.trim()) {
    throw new Error("Email recipient is required");
  }
  const t = await getTransporter();
  const html =
    customHtml ||
    `
    <h2>Your Code: <strong style="font-size:24px;color:#c62828">${code}</strong></h2>
    <p>Valid for 15 minutes.</p>
  `;
  await t.sendMail({
    from: `"Pizzeria" <${process.env.EMAIL_ADDRESS}>`,
    to: email.trim(),
    subject: customHtml ? "Your Coupon" : "2FA Code",
    html,
  });
};

export const sendEmailChangeLink = async (email, username, changeLink) => {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    throw new Error("Email recipient is required");
  }
  const t = await getTransporter();
  await t.sendMail({
    from: `"Pizzeria" <${process.env.EMAIL_ADDRESS}>`,
    to: trimmedEmail,
    subject: "Change Your Email Address",
    html: `<p>Hi ${username},</p>
           <p>You requested to change your email address.</p>
           <p>Click <a href="${changeLink}">here</a> to set your new email.</p>
           <p>This link expires in 1 hour.</p>
           <p>If you didn't request this, you can safely ignore this email.</p>`,
  });
};
export const sendUnlockEmail = async (
  email,
  username,
  unlockLink,
  resetLink
) => {
  if (!email || !email.trim()) {
    throw new Error("Email recipient is required");
  }
  const t = await getTransporter();
  await t.sendMail({
    from: `"Pizzeria" <${process.env.EMAIL_ADDRESS}>`,
    to: email.trim(),
    subject: "Account Locked",
    html: `<p>Hi ${username}, your account is locked.</p>
           <p><a href="${unlockLink}">Unlock</a> | <a href="${resetLink}">Reset Password</a></p>`,
  });
};

export const sendPasswordResetEmail = async (email, username, resetLink) => {
  if (!email || !email.trim()) {
    throw new Error("Email recipient is required");
  }
  const t = await getTransporter();
  await t.sendMail({
    from: `"Pizzeria" <${process.env.EMAIL_ADDRESS}>`,
    to: email.trim(),
    subject: "Reset Your Password",
    html: `<p>Hi ${username},</p><p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  });
};

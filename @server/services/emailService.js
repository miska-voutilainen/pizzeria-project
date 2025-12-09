// @server/services/emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (!process.env.EMAIL_ADDRESS || !process.env.EMAIL_SECRET) {
    throw new Error("EMAIL_ADDRESS or EMAIL_SECRET missing in .env.local");
  }

  console.log("Creating SMTP transporter for Namecheap Email Pro:", {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_ADDRESS,
  });

  console.log("Auth credentials check:", {
    emailExists: !!process.env.EMAIL_ADDRESS,
    passwordExists: !!process.env.EMAIL_SECRET,
    passwordLength: process.env.EMAIL_SECRET
      ? process.env.EMAIL_SECRET.length
      : 0,
    passwordFirstChar: process.env.EMAIL_SECRET
      ? process.env.EMAIL_SECRET[0]
      : "none",
  });

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    requireTLS: true, // Required for Namecheap
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_SECRET,
    },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
    debug: true,
    logger: true,
  });

  try {
    console.log("Attempting SMTP verification for Namecheap...");
    await transporter.verify();
    console.log("SMTP connection verified successfully");
    return transporter;
  } catch (error) {
    console.error("SMTP verification failed:", error.message);
    console.error("Error details:", {
      code: error.code,
      response: error.response,
      responseCode: error.responseCode,
      command: error.command,
    });
    throw error;
  }
};

export const sendVerificationEmail = async (email, username, verifyLink) => {
  const mailOptions = {
    from: `"Pizzeria" <${process.env.EMAIL_ADDRESS}>`,
    to: email,
    subject: "Verify Your Email Address",
    text: `Hi ${username},\n\nVerify your email: ${verifyLink}\n\nThis link expires in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #f9f9f9; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h2 style="color: #c62828; text-align: center; margin-bottom: 20px;">Pizzeria</h2>
        <p style="font-size: 16px; color: #333;">Hi <strong>${username}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Welcome! Please verify your email to continue:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyLink}" 
             style="background:#c62828; color:white; padding:14px 32px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:16px; display:inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          <small>This link expires in <strong>15 minutes</strong>.</small>
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          © 2025 Pizza Web Oy. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    const t = await getTransporter();
    const info = await t.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send verification email:", error.message);
    throw error;
  }
};

export const sendUnlockEmail = async (
  email,
  username,
  unlockLink,
  resetLink
) => {
  const mailOptions = {
    from: `"Pizzeria" <${process.env.EMAIL_ADDRESS}>`,
    to: email,
    subject: "Account Locked – Action Required",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <h2 style="color: #c62828;">Account Security Alert</h2>
        <p>Hi <strong>${username}</strong>,</p>
        <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
        <p>Please choose one of the options below:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${unlockLink}" style="background:#1976d2; color:white; padding:12px 24px; margin:0 10px; text-decoration:none; border-radius:6px; font-weight:bold;">
            Unlock Account
          </a>
          <a href="${resetLink}" style="background:#d32f2f; color:white; padding:12px 24px; margin:0 10px; text-decoration:none; border-radius:6px; font-weight:bold;">
            Reset Password
          </a>
        </div>
        <p style="color:#666; font-size:14px;">
          <small>These links expire in <strong>24 hours</strong>.</small>
        </p>
        <hr style="border:0; border-top:1px solid #eee; margin:30px 0;">
        <p style="color:#999; font-size:12px; text-align:center;">
          © 2025 Pizza Web Oy
        </p>
      </div>
    `,
  };

  try {
    const t = await getTransporter();
    const info = await t.sendMail(mailOptions);
    console.log("Account unlock email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send unlock email:", error.message);
    throw error;
  }
};

export const send2FAEmail = async (
  email,
  username,
  code,
  customHtml = null
) => {
  const mailOptions = {
    from: `"Pizzeria" <${process.env.EMAIL_ADDRESS}>`,
    to: email,
    subject: customHtml ? "Newsletter Subscription" : "Your 2FA Setup Code",
    text: `Hi ${username},\n\nYour code is: ${code}\n\nThis code expires in 15 minutes.`,
    html:
      customHtml ||
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #f9f9f9; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h2 style="color: #c62828; text-align: center; margin-bottom: 20px;">Pizzeria</h2>
        <p style="font-size: 16px; color: #333;">Hi <strong>${username}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Your 2FA setup code is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #f5f5f5; border: 2px dashed #c62828; padding: 20px; border-radius: 8px; font-size: 24px; font-weight: bold; color: #c62828; letter-spacing: 4px;">
            ${code}
          </div>
        </div>
        <p style="color: #666; font-size: 14px; text-align: center;">
          <small>This code expires in <strong>15 minutes</strong>.</small>
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          © 2025 Pizza Web Oy. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    const t = await getTransporter();
    const info = await t.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error.message);
    throw error;
  }
};

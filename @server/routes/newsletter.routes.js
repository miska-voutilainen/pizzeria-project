import express from "express";
import { randomBytes } from "crypto";
import { send2FAEmail } from "../services/email.service.js";

export default function createNewsletterRouter(pool) {
  const router = express.Router();

  const generateCouponCode = () => randomBytes(6).toString("hex").toUpperCase();

  router.post("/subscribe", async (req, res) => {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Valid email required" });
    }

    try {
      const [existing] = await pool.execute(
        `SELECT id FROM user_coupons
         WHERE LOWER(email) = LOWER(?) AND used = 0 AND expiresAt > NOW()`,
        [email]
      );

      if (existing.length > 0) {
        return res
          .status(400)
          .json({ message: "You already have an active coupon!" });
      }

      const couponCode = generateCouponCode();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await pool.execute(
        `INSERT INTO user_coupons (email, coupon, createdAt, expiresAt, used)
         VALUES (?, ?, NOW(), ?, 0)`,
        [email, couponCode, expiresAt]
      );

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #f9f9f9; border-radius: 12px;">
          <h2 style="color: #c62828; text-align: center;">Pizzeria</h2>
          <p>Thank you for subscribing!</p>
          <p>Here's your exclusive 10% discount:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #fff; border: 3px dashed #c62828; padding: 20px; border-radius: 10px; font-size: 28px; font-weight: bold; color: #c62828;">
              ${couponCode}
            </div>
          </div>
          <p style="text-align: center;">Valid until ${expiresAt.toLocaleDateString()}</p>
        </div>
      `;

      await send2FAEmail(email, "Subscriber", couponCode, html);
      res
        .status(201)
        .json({ message: "Subscribed! Check your email for the coupon." });
    } catch (error) {
      console.error("Newsletter error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post("/validate-coupon", async (req, res) => {
    const { coupon } = req.body;
    if (!coupon)
      return res.status(400).json({ valid: false, message: "Code required" });

    const code = coupon.toUpperCase().trim();

    // Check general coupons first
    const [general] = await pool.execute(
      `SELECT discount_percent FROM coupons
        WHERE LOWER(coupon) = LOWER(?) AND (expires_at IS NULL OR expires_at > NOW())`,
      [code]
    );

    if (general.length > 0) {
      return res.json({
        valid: true,
        discount: general[0].discount_percent,
        type: "general",
      });
    }

    const [userCoupon] = await pool.execute(
      `SELECT used, expiresAt FROM user_coupons
        WHERE coupon = ? AND expiresAt > NOW()`,
      [code]
    );

    if (userCoupon.length === 0) {
      return res.json({ valid: false, message: "Invalid or expired" });
    }

    if (userCoupon[0].used) {
      return res.json({ valid: false, message: "Already used" });
    }

    res.json({ valid: true, discount: 10, type: "user" });
  });

  return router;
}

import express from "express";
import { randomBytes } from "crypto";
import { send2FAEmail } from "../services/emailService.js";

function newsletterRoutes(pool) {
  const router = express.Router();

  // Generate a unique coupon code
  const generateCouponCode = () => {
    return randomBytes(6).toString("hex").toUpperCase();
  };

  // Subscribe to newsletter
  router.post("/subscribe", async (req, res) => {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    try {
      // Check if email already has a valid (unused) coupon
      const [existingCoupons] = await pool.execute(
        `SELECT id FROM user_coupons 
         WHERE LOWER(email) = LOWER(?) AND used = 0 AND expiresAt > NOW()`,
        [email]
      );

      if (existingCoupons.length > 0) {
        return res.status(400).json({
          message: "You already have an active coupon. Check your email!",
        });
      }

      // Generate coupon code
      const couponCode = generateCouponCode();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Store coupon in database
      await pool.execute(
        `INSERT INTO user_coupons (email, coupon, createdAt, expiresAt, used)
         VALUES (?, ?, NOW(), ?, 0)`,
        [email, couponCode, expiresAt]
      );

      // Send email with coupon
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #f9f9f9; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: #c62828; text-align: center; margin-bottom: 20px;">Pizzeria</h2>
          <p style="font-size: 16px; color: #333;">Welcome to our newsletter!</p>
          <p style="font-size: 16px; color: #333;">Thank you for subscribing. Here's your exclusive 10% discount coupon:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #f5f5f5; border: 2px dashed #c62828; padding: 20px; border-radius: 8px; font-size: 24px; font-weight: bold; color: #c62828; letter-spacing: 4px;">
              ${couponCode}
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            <small>This coupon expires on <strong>${expiresAt.toLocaleDateString()}</strong></small>
          </p>
          
          <p style="font-size: 16px; color: #333;">Use this code at checkout to get 10% off your first order!</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2025 Pizza Web Oy. All rights reserved.
          </p>
        </div>
      `;

      await send2FAEmail(
        email,
        "Newsletter Subscriber",
        couponCode,
        emailContent
      );

      return res.status(201).json({
        message:
          "Successfully subscribed! Check your email for your coupon code.",
      });
    } catch (error) {
      console.error("Newsletter subscribe error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Validate coupon (optional endpoint for customers)
  router.post("/validate-coupon", async (req, res) => {
    const { coupon } = req.body;

    if (!coupon || !coupon.trim()) {
      return res
        .status(400)
        .json({ valid: false, message: "Coupon code required" });
    }

    try {
      const couponCode = coupon.toUpperCase();

      // First, check general coupons table
      const [generalCoupons] = await pool.execute(
        `SELECT id, discount_percent FROM coupons 
         WHERE LOWER(coupon) = LOWER(?) AND (expires_at IS NULL OR expires_at > NOW())`,
        [couponCode]
      );

      if (generalCoupons.length > 0) {
        const couponRecord = generalCoupons[0];
        return res.json({
          valid: true,
          message: "Coupon is valid!",
          discount: couponRecord.discount_percent,
          type: "general",
        });
      }

      // If not found in general coupons, check user_coupons table
      const [userCoupons] = await pool.execute(
        `SELECT id, used, expiresAt FROM user_coupons 
         WHERE coupon = ? AND expiresAt > NOW()`,
        [couponCode]
      );

      if (userCoupons.length === 0) {
        return res
          .status(400)
          .json({ valid: false, message: "Invalid or expired coupon" });
      }

      const userCouponRecord = userCoupons[0];

      if (userCouponRecord.used) {
        return res
          .status(400)
          .json({ valid: false, message: "Coupon already used" });
      }

      return res.json({
        valid: true,
        message: "Coupon is valid!",
        discount: 10,
        type: "user",
      });
    } catch (error) {
      console.error("Validate coupon error:", error);
      return res.status(500).json({ valid: false, message: "Server error" });
    }
  });

  return router;
}

export default newsletterRoutes;

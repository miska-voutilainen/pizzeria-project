import express from "express";
import { requireAdmin } from "../middleware/admin.js";

function generateOrderId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function createOrderRouter(pool) {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const {
      items,
      totalAmount,
      paymentMethod,
      deliveryType,
      shippingAddress,
      customerName,
      customerPhone,
      couponApplied,
      discountAmount = 0,
    } = req.body;

    const userId = req.user?.userId || null;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain items" });
    }
    if (!customerName || !customerPhone) {
      return res.status(400).json({ error: "Name and phone required" });
    }
    if (deliveryType === "delivery" && !shippingAddress) {
      return res.status(400).json({ error: "Address required for delivery" });
    }

    try {
      const orderId = generateOrderId();

      await pool.execute(
        `INSERT INTO order_data
          (orderId, userId, items, totalAmount, status, paymentMethod, deliveryType,
          shippingAddress, customerName, customerPhone, couponApplied, discountAmount, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          orderId,
          userId,
          JSON.stringify(items),
          totalAmount,
          paymentMethod,
          deliveryType,
          shippingAddress ? JSON.stringify(shippingAddress) : null,
          customerName,
          customerPhone,
          couponApplied || null,
          discountAmount,
        ]
      );

      return res.status(201).json({
        success: true,
        orderId,
        message: "Order created successfully",
      });
    } catch (err) {
      console.error("Order creation error:", err);
      return res.status(500).json({ error: "Failed to create order" });
    }
  });

  router.get("/:orderId", async (req, res) => {
    try {
      const [rows] = await pool.execute(
        "SELECT orderId, status, created_at, totalAmount, deliveryType FROM order_data WHERE orderId = ?",
        [req.params.orderId]
      );
      if (!rows[0]) return res.status(404).json({ error: "Order not found" });
      res.json({ success: true, order: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  router.get("/my-orders", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    try {
      const [rows] = await pool.execute(
        `SELECT o.*,
          JSON_UNQUOTE(o.items) as items,
          JSON_UNQUOTE(o.shippingAddress) as shippingAddress
         FROM order_data o
         WHERE o.userId = ?
         ORDER BY o.created_at DESC`,
        [req.user.userId]
      );

      const parsed = rows.map((row) => ({
        ...row,
        items: row.items ? JSON.parse(row.items) : [],
        shippingAddress: row.shippingAddress
          ? JSON.parse(row.shippingAddress)
          : null,
      }));

      res.json(parsed);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  router.put("/:orderId", requireAdmin, async (req, res) => {
    const { status, shippingAddress } = req.body;

    try {
      if (status !== undefined) {
        await pool.execute(
          `UPDATE order_data SET status = ?, updated_at = NOW() WHERE orderId = ?`,
          [status, req.params.orderId]
        );
      }
      if (shippingAddress !== undefined) {
        await pool.execute(
          `UPDATE order_data SET shippingAddress = ?, updated_at = NOW() WHERE orderId = ?`,
          [
            typeof shippingAddress === "string"
              ? shippingAddress
              : JSON.stringify(shippingAddress),
            req.params.orderId,
          ]
        );
      }
      res.json({ message: "Order updated" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  return router;
}

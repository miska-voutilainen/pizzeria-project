// routes/orderRoutes.js
import express from "express";

// Helper function to generate random 6-digit order ID
function generateOrderId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function orderRoutes(pool) {
  const router = express.Router();
  // POST - Create new order
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
      discountAmount,
    } = req.body;

    // Get userId from authenticated session, or use NULL for non-authenticated users
    const userId = req.user?.userId || null;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Order must contain items" });
    }

    if (!customerName || !customerPhone) {
      return res
        .status(400)
        .json({ error: "Customer name and phone are required" });
    }

    if (deliveryType === "delivery" && !shippingAddress) {
      return res
        .status(400)
        .json({ error: "Shipping address is required for delivery" });
    }

    try {
      const orderId = generateOrderId();
      const status = "pending";

      await pool.execute(
        `INSERT INTO order_data 
        (orderId, userId, items, totalAmount, status, paymentMethod, deliveryType, shippingAddress, customerName, customerPhone, couponApplied, discountAmount, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          orderId,
          userId,
          JSON.stringify(items),
          totalAmount,
          status,
          paymentMethod,
          deliveryType,
          shippingAddress ? JSON.stringify(shippingAddress) : null,
          customerName,
          customerPhone,
          couponApplied || null,
          discountAmount || 0,
        ]
      );

      res.status(201).json({
        success: true,
        orderId: orderId,
        message: "Order created successfully",
      });
    } catch (err) {
      console.error("POST /orders error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // GET user's own orders
  router.get("/my-orders", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const [rows] = await pool.execute(
        `
      SELECT 
        o.*,
        JSON_UNQUOTE(o.items) as items,
        JSON_UNQUOTE(o.shippingAddress) as shippingAddress,
        u.username,
        u.email
      FROM order_data o
      LEFT JOIN user_data u ON o.userId = u.userId
      WHERE o.userId = ?
      ORDER BY o.created_at DESC
    `,
        [req.user.userId]
      );

      const parsedRows = rows.map((row) => ({
        ...row,
        items: row.items ? JSON.parse(row.items) : [],
        shippingAddress: row.shippingAddress
          ? JSON.parse(row.shippingAddress)
          : null,
      }));

      res.json(parsedRows);
    } catch (err) {
      console.error("GET /my-orders error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // GET all orders — admin only (can filter by userId via query param)
  router.get("/", async (req, res) => {
    console.log("GET /orders called");
    console.log("req.user:", req.user);
    console.log("req.cookies:", req.cookies);

    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.user.role !== "administrator") {
      return res.status(403).json({ error: "Admin only" });
    }

    try {
      const { userId } = req.query; // Optional query parameter to filter by userId
      let query = `
      SELECT 
        o.*,
        JSON_UNQUOTE(o.items) as items,
        JSON_UNQUOTE(o.shippingAddress) as shippingAddress,
        u.username,
        u.email
      FROM order_data o
      LEFT JOIN user_data u ON o.userId = u.userId
      `;

      const params = [];
      if (userId) {
        query += `WHERE o.userId = ? `;
        params.push(userId);
      }

      query += `ORDER BY o.created_at DESC`;

      const [rows] = await pool.execute(query, params);

      const parsedRows = rows.map((row) => ({
        ...row,
        items: row.items ? JSON.parse(row.items) : [],
        shippingAddress: row.shippingAddress
          ? JSON.parse(row.shippingAddress)
          : null,
      }));

      res.json(parsedRows);
    } catch (err) {
      console.error("GET /orders error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // UPDATE order status — admin only
  router.put("/:orderId", async (req, res) => {
    if (req.user?.role !== "administrator")
      return res.status(403).json({ error: "Admin only" });
    const { status, shippingAddress } = req.body;
    try {
      if (status !== undefined && shippingAddress !== undefined) {
        const addressToSave =
          typeof shippingAddress === "string"
            ? shippingAddress
            : JSON.stringify(shippingAddress);
        await pool.execute(
          `UPDATE order_data SET status = ?, shippingAddress = ?, updated_at = NOW() WHERE orderId = ?`,
          [status, addressToSave, req.params.orderId]
        );
      } else if (status !== undefined) {
        await pool.execute(
          `UPDATE order_data SET status = ?, updated_at = NOW() WHERE orderId = ?`,
          [status, req.params.orderId]
        );
      } else if (shippingAddress !== undefined) {
        const addressToSave =
          typeof shippingAddress === "string"
            ? shippingAddress
            : JSON.stringify(shippingAddress);
        await pool.execute(
          `UPDATE order_data SET shippingAddress = ?, updated_at = NOW() WHERE orderId = ?`,
          [addressToSave, req.params.orderId]
        );
      } else {
        return res.status(400).json({ error: "No fields to update" });
      }
      res.json({ message: "Order updated successfully" });
    } catch (err) {
      console.error("PUT /:orderId error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  return router;
}

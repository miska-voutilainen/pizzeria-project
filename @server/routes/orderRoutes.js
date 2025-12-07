// routes/orderRoutes.js
import express from "express";
const router = express.Router();

export default function orderRoutes(pool) {
  // GET all orders — admin only
  router.get("/", async (req, res) => {
    if (req.user?.role !== "administrator")
      return res.status(403).json({ error: "Admin only" });
    try {
      const [rows] = await pool.execute(`
        SELECT o.*, u.username, u.email
        FROM orders o
        JOIN user_data u ON o.userId = u.userId
        ORDER BY o.createdAt DESC
      `);
      // Also get items for each order
      for (let order of rows) {
        const [items] = await pool.execute(
          `SELECT slug, name, quantity, price FROM order_items WHERE orderId = ?`,
          [order.id]
        );
        order.items = items;
      }
      res.json(rows);
    } catch (err) {
      console.error("GET /orders error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // UPDATE order status — admin only
  router.put("/:id", async (req, res) => {
    if (req.user?.role !== "administrator")
      return res.status(403).json({ error: "Admin only" });
    const { status } = req.body;
    try {
      await pool.execute(`UPDATE orders SET status = ? WHERE id = ?`, [
        status,
        req.params.id,
      ]);
      res.json({ message: "Status updated" });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  return router;
}

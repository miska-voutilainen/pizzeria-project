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
        FROM order_data o
        JOIN user_data u ON o.userId = u.userId
        ORDER BY o.created_at DESC
      `);
      res.json(rows);
    } catch (err) {
      console.error("GET /orders error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // UPDATE order status — admin only
  router.put("/:orderId", async (req, res) => {
    if (req.user?.role !== "administrator")
      return res.status(403).json({ error: "Admin only" });
    const { status } = req.body;
    try {
      await pool.execute(
        `UPDATE order_data SET status = ?, updated_at = NOW() WHERE orderId = ?`,
        [status, req.params.orderId]
      );
      res.json({ message: "Status updated" });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  return router;
}

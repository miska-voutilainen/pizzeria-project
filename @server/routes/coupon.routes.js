import express from "express";
import { requireAdmin } from "../middleware/admin.js";

export default function createCouponRouter(pool) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const [rows] = await pool.execute("SELECT * FROM coupons ORDER BY id DESC");
    res.json(rows);
  });

  router.get("/:id", async (req, res) => {
    const [rows] = await pool.execute("SELECT * FROM coupons WHERE id = ?", [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  });

  router.post("/", requireAdmin, async (req, res) => {
    const { coupon, discount_percent, expires_at } = req.body;
    const [result] = await pool.execute(
      "INSERT INTO coupons (coupon, discount_percent, expires_at) VALUES (?, ?, ?)",
      [coupon, discount_percent || null, expires_at || null]
    );
    res
      .status(201)
      .json({ id: result.insertId, coupon, discount_percent, expires_at });
  });

  router.put("/:id", requireAdmin, async (req, res) => {
    const { coupon, discount_percent, expires_at } = req.body;
    const [result] = await pool.execute(
      "UPDATE coupons SET coupon = ?, discount_percent = ?, expires_at = ? WHERE id = ?",
      [coupon, discount_percent || null, expires_at || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404);
    res.json({ message: "Updated" });
  });

  router.delete("/:id", requireAdmin, async (req, res) => {
    await pool.execute("DELETE FROM coupons WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  });

  return router;
}

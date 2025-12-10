import express from "express";

function couponRoutes(pool) {
  const router = express.Router();

  // GET all coupons
  router.get("/", async (req, res) => {
    try {
      const [coupons] = await pool.execute(
        "SELECT * FROM coupons ORDER BY id DESC"
      );
      res.json(coupons);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      res.status(500).json({ error: "Failed to fetch coupons" });
    }
  });

  // GET single coupon by ID
  router.get("/:id", async (req, res) => {
    try {
      const [coupons] = await pool.execute(
        "SELECT * FROM coupons WHERE id = ?",
        [req.params.id]
      );
      if (coupons.length === 0) {
        return res.status(404).json({ error: "Coupon not found" });
      }
      res.json(coupons[0]);
    } catch (error) {
      console.error("Failed to fetch coupon:", error);
      res.status(500).json({ error: "Failed to fetch coupon" });
    }
  });

  // POST create new coupon
  router.post("/", async (req, res) => {
    try {
      const { coupon, discount_percent, expires_at } = req.body;

      if (!coupon) {
        return res.status(400).json({ error: "Coupon code is required" });
      }

      const result = await pool.execute(
        "INSERT INTO coupons (coupon, discount_percent, expires_at) VALUES (?, ?, ?)",
        [coupon, discount_percent || null, expires_at || null]
      );

      res.status(201).json({
        id: result[0].insertId,
        coupon,
        discount_percent,
        expires_at,
      });
    } catch (error) {
      console.error("Failed to create coupon:", error);
      res.status(500).json({ error: "Failed to create coupon" });
    }
  });

  // PUT update coupon
  router.put("/:id", async (req, res) => {
    try {
      const { coupon, discount_percent, expires_at } = req.body;

      const result = await pool.execute(
        "UPDATE coupons SET coupon = ?, discount_percent = ?, expires_at = ? WHERE id = ?",
        [coupon, discount_percent || null, expires_at || null, req.params.id]
      );

      if (result[0].affectedRows === 0) {
        return res.status(404).json({ error: "Coupon not found" });
      }

      res.json({
        id: req.params.id,
        coupon,
        discount_percent,
        expires_at,
      });
    } catch (error) {
      console.error("Failed to update coupon:", error);
      res.status(500).json({ error: "Failed to update coupon" });
    }
  });

  // DELETE coupon
  router.delete("/:id", async (req, res) => {
    try {
      const result = await pool.execute("DELETE FROM coupons WHERE id = ?", [
        req.params.id,
      ]);

      if (result[0].affectedRows === 0) {
        return res.status(404).json({ error: "Coupon not found" });
      }

      res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
      console.error("Failed to delete coupon:", error);
      res.status(500).json({ error: "Failed to delete coupon" });
    }
  });

  return router;
}

export default couponRoutes;

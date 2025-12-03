// src/routes/productRoutes.js
import express from "express";

function productRoutes(pool) {
  const router = express.Router();

  const getProducts = async (category = null) => {
    const sql = category
      ? `SELECT slug, name, description, price, imgUrl
         FROM product_data
         WHERE category = ?
         ORDER BY sort_order, name`
      : `SELECT slug, name, description, price, imgUrl
         FROM product_data
         ORDER BY sort_order, name`;

    const [rows] = await pool.execute(sql, category ? [category] : []);
    return rows;
  };

  // 1. ALL PRODUCTS
  router.get("/", async (req, res) => {
    try {
      res.json(await getProducts());
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // 2. CATEGORY ROUTES — MUST COME BEFORE :slug !!
  router.get("/pizza", async (req, res) =>
    res.json(await getProducts("pizza"))
  );
  router.get("/drinks", async (req, res) =>
    res.json(await getProducts("drinks"))
  );

  // 3. SINGLE PRODUCT — LAST!
  router.get("/:slug", async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT slug, name, description, price, imgUrl FROM product_data WHERE slug = ?`,
        [req.params.slug]
      );
      rows.length
        ? res.json(rows[0])
        : res.status(404).json({ message: "Not found" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  return router;
}

export default productRoutes;

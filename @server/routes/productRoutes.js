// routes/productRoutes.js
import express from "express";

function productRoutes(pool) {
  const router = express.Router();

  // Helper: get all products (public)
  const getProducts = async (category = null) => {
    const sql = category
      ? `SELECT id, slug, name, description, price, imgUrl, category, sort_order AS sortOrder
         FROM product_data WHERE category = ? ORDER BY sort_order, name`
      : `SELECT id, slug, name, description, price, imgUrl, category, sort_order AS sortOrder
         FROM product_data ORDER BY sort_order, name`;
    const [rows] = await pool.execute(sql, category ? [category] : []);
    return rows;
  };

  // ========= PUBLIC ROUTES =========
  router.get("/", async (req, res) => {
    try {
      const products = await getProducts();
      res.json(products);
    } catch (err) {
      console.error("GET /products error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  router.get("/pizza", async (req, res) => {
    try {
      const pizzas = await getProducts("pizza");
      res.json(pizzas);
    } catch (err) {
      console.error("GET /pizza error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  router.get("/drinks", async (req, res) => {
    try {
      const drinks = await getProducts("drinks");
      res.json(drinks);
    } catch (err) {
      console.error("GET /drinks error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  router.get("/:slug", async (req, res) => {
    const { slug } = req.params;
    try {
      const [rows] = await pool.execute(
        `SELECT id, slug, name, description, price, imgUrl, category, sort_order AS sortOrder
         FROM product_data WHERE slug = ?`,
        [slug]
      );
      if (!rows[0]) return res.status(404).json({ message: "Not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error("GET /:slug error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ========= ADMIN-ONLY ROUTES (add this middleware at the top of your server!) =========
  const requireAdmin = async (req, res, next) => {
    if (!req.user || req.user.role !== "administrator") {
      return res.status(403).json({ error: "Admin only" });
    }
    next();
  };

  // ADD NEW PRODUCT
  router.post("/", requireAdmin, async (req, res) => {
    const {
      id,
      name,
      slug,
      description,
      price,
      imgUrl,
      category = "pizza",
      sortOrder = 50,
    } = req.body;

    if (!name || !slug || !price || !imgUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      await pool.execute(
        `INSERT INTO product_data 
         (id, slug, name, description, price, imgUrl, category, sort_order)
         VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)`,
        [slug, name, description || "", price, imgUrl, category, sortOrder]
      );
      res.status(201).json({ message: "Product added", slug });
    } catch (err) {
      console.error("POST /products error:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Slug already exists" });
      }
      res.status(500).json({ error: "Server error" });
    }
  });

  // UPDATE PRODUCT
  router.put("/:slug", requireAdmin, async (req, res) => {
    const { slug } = req.params;
    const { name, description, price, imgUrl, category, sortOrder } = req.body;

    try {
      const [result] = await pool.execute(
        `UPDATE product_data 
         SET id = ?, name = ?, description = ?, price = ?, imgUrl = ?, category = ?, sort_order = ?
         WHERE slug = ?`,
        [
          name,
          description || "",
          price,
          imgUrl,
          category || "pizza",
          sortOrder || 50,
          slug,
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ message: "Product updated" });
    } catch (err) {
      console.error("PUT /products/:slug error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // DELETE PRODUCT
  router.delete("/:slug", requireAdmin, async (req, res) => {
    const { slug } = req.params;
    try {
      const [result] = await pool.execute(
        `DELETE FROM product_data WHERE slug = ?`,
        [slug]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ message: "Product deleted" });
    } catch (err) {
      console.error("DELETE /products/:slug error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  return router;
}

export default productRoutes;

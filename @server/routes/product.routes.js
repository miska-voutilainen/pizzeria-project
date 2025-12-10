import express from "express";
import { requireAdmin } from "../middleware/admin.js";

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export default function createProductRouter(pool) {
  const router = express.Router();

  const getProducts = async (category = null) => {
    const sql = category
      ? `SELECT id, slug, name, description, price, imgUrl, category, sort_order AS sortOrder
          FROM product_data WHERE category = ? ORDER BY sort_order, name`
      : `SELECT id, slug, name, description, price, imgUrl, category, sort_order AS sortOrder         
          FROM product_data ORDER BY sort_order, name`;
    const [rows] = await pool.execute(sql, category ? [category] : []);
    return rows;
  };

  router.get("/", (req, res) =>
    getProducts()
      .then((p) => res.json(p))
      .catch(() => res.status(500))
  );
  router.get("/pizza", (req, res) =>
    getProducts("pizza").then((p) => res.json(p))
  );
  router.get("/drinks", (req, res) =>
    getProducts("drinks").then((p) => res.json(p))
  );
  router.get("/:slug", async (req, res) => {
    const [rows] = await pool.execute(
      "SELECT * FROM product_data WHERE slug = ?",
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  });

  router.post("/", requireAdmin, async (req, res) => {
    const {
      name,
      slug,
      description,
      price,
      imgUrl,
      category = "pizza",
      sortOrder = 50,
    } = req.body;
    const finalSlug = slug || generateSlug(name);
    try {
      const id = Math.floor(100000 + Math.random() * 900000).toString();
      await pool.execute(
        `INSERT INTO product_data (id, slug, name, description, price, imgUrl, category, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          finalSlug,
          name,
          description || "",
          price,
          imgUrl,
          category,
          sortOrder,
        ]
      );
      res.status(201).json({ message: "Product added", slug: finalSlug });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY")
        return res.status(400).json({ error: "Slug exists" });
      res.status(500).json({ error: "Server error" });
    }
  });

  router.put("/:slug", requireAdmin, async (req, res) => {
    const { name, description, price, imgUrl, category, sortOrder } = req.body;
    await pool.execute(
      `UPDATE product_data SET name = ?, description = ?, price = ?, imgUrl = ?, category = ?, sort_order = ? WHERE slug = ?`,
      [
        name,
        description || "",
        price,
        imgUrl,
        category || "pizza",
        sortOrder || 50,
        req.params.slug,
      ]
    );
    res.json({ message: "Updated" });
  });

  router.delete("/:slug", requireAdmin, async (req, res) => {
    await pool.execute("DELETE FROM product_data WHERE slug = ?", [
      req.params.slug,
    ]);
    res.json({ message: "Deleted" });
  });

  return router;
}

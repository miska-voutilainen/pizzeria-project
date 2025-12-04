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

  router.get("/", async (req, res) => {
    try {
      const products = await getProducts();
      res.json(products);
    } catch (error) {
      console.error("GET /products error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  router.get("/pizza", async (req, res) => {
    try {
      const pizzas = await getProducts("pizza");
      res.json(pizzas);
    } catch (error) {
      console.error("GET /pizza error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  router.get("/drinks", async (req, res) => {
    try {
      const drinks = await getProducts("drinks");
      res.json(drinks);
    } catch (error) {
      console.error("GET /drinks error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  router.get("/:slug", async (req, res) => {
    const { slug } = req.params;

    try {
      const [rows] = await pool.execute(
        `SELECT slug, name, description, price, imgUrl 
         FROM product_data 
         WHERE slug = ?`,
        [slug]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error(`GET /${slug} error:`, error);
      res.status(500).json({ error: "Server error" });
    }
  });

  return router;
}

export default productRoutes;

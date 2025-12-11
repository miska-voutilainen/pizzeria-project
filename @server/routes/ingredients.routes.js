// @server/routes/ingredients.routes.js

import express from "express";

export default function createIngredientsRouter(pool) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT id, name, slug, price, imgUrl
        FROM pizzeriadb.ingredients
        ORDER BY name ASC
      `);

      res.json(rows);
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
      res.status(500).json({ error: "Database error" });
    }
  });

  return router;
}

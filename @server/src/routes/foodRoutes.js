import express from "express";

function foodRoutes(pool) {
  const router = express.Router();

  //#1 - Retrive All Foods
  //http://localhost:3001/"Home Page"
  router.get("/", async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT _id, tag, name, description, price, imgUrl 
      FROM productdata`
      );

      !rows.length // Advanced if/else (? :)
        ? res.status(404).json({ message: "No foods found" })
        : res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  //#1 - Retrive One
  //http://localhost:3001/:id
  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await pool.execute(
        `SELECT _id, tag, name, description, price, imgUrl 
      FROM productdata
      WHERE _id = ?`,
        [id]
      );

      !rows[0] // Advanced if/else (? :)
        ? res.status(404).json({ message: "No foods found" })
        : res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  return router;
}

export default foodRoutes;

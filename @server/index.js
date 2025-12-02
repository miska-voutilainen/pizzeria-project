import express from "express";
import cors from "cors";
import { connectMariaDB, closeMariaDB } from "./config/db.js";
import createAuthRoutes from "./src/routes/authRoutes.js";
import foodRoutes from "./src/routes/foodRoutes.js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

(async () => {
  const pool = await connectMariaDB();
  const app = express();
  app.use(cors());

  app.use(express.json());
  app.use("/api", createAuthRoutes(pool));
  app.use("/", foodRoutes(pool));

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );

  // graceful shutdown
  process.on("SIGINT", async () => {
    await closeMariaDB();
    process.exit(0);
  });
})();

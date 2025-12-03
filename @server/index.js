import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { connectDB, closeDB } from "./config/db.js";
import createAuthRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import { createSessionService } from "./services/sessionService.js";

dotenv.config({ path: ".env.development" });

(async () => {
  const pool = await connectDB();
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  const sessionService = createSessionService(pool);
  app.use(sessionService.sessionMiddleware);

  app.use("/api", createAuthRoutes({ pool, ...sessionService }));
  app.use("/", productRoutes(pool));

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );

  process.on("SIGINT", async () => {
    await closeDB();
    process.exit(0);
  });
})();

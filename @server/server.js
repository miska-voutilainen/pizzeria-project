import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { connectDB, closeDB } from "./config/db.js";
import createAuthRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { createSessionService } from "./services/sessionService.js";

dotenv.config({ path: ".env.local" });

(async () => {
  const pool = await connectDB();

  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(cookieParser());

  const sessionService = createSessionService(pool);
  app.use(sessionService.sessionMiddleware);

  app.use("/api", createAuthRoutes({ pool, ...sessionService }));
  app.use("/", productRoutes(pool));

  const PORT = process.env.PORT || 3001;

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  process.on("SIGINT", async () => {
    await closeDB();
    console.log("Server shut down gracefully");
    process.exit(0);
  });
})();

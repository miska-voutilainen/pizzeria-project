// @server/server.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { connectDB, closeDB } from "./config/db.js";
import createAuthRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { createSessionService } from "./services/sessionService.js";

dotenv.config({ path: ".env.development" });

(async () => {
  const pool = await connectDB();

  const app = express();

  // CRITICAL: Allow credentials
  app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:5173"],
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
    console.log("Server shut down");
    process.exit(0);
  });
})();

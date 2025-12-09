import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { connectDB, closeDB } from "./config/db.js";
import createAuthRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import { createSessionService } from "./services/sessionService.js";

dotenv.config({ path: ".env.development" });

(async () => {
  const pool = await connectDB();

  const app = express();

  // CRITICAL: Allow credentials
  app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:5173"], // public + admin ports
      credentials: true, // allows cookies/sessions
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  );

  app.use(express.json());
  app.use(cookieParser());

  const sessionService = createSessionService(pool);
  app.use(sessionService.sessionMiddleware);

  app.use("/api/auth", createAuthRoutes({ pool, ...sessionService }));
  app.use("/api/products", productRoutes(pool));
  app.use("/api/orders", orderRoutes(pool));
  app.use("/api/newsletter", newsletterRoutes(pool));

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

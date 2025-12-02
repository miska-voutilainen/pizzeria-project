import express from "express";
import cookieParser from "cookie-parser";
import { connectDB, closeDB } from "./config/db.js";
import createAuthRoutes from "./src/routes/authRoutes.js";
import { createSessionService } from "./services/sessionService.js";

(async () => {
  const pool = await connectDB();
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  const sessionService = createSessionService(pool);

  app.use(sessionService.sessionMiddleware);

  app.use("/api", createAuthRoutes({ pool, ...sessionService }));

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });

  process.on("SIGINT", async () => {
    await closeDB();
    process.exit(0);
  });
})();

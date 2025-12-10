import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/db.js";
import createSessionService from "./services/session.service.js";
import { errorHandler } from "./middleware/errorHandler.js";

import createAuthRouter from "./routes/auth.routes.js";
import createAdminRouter from "./routes/admin.routes.js";
import createOrderRouter from "./routes/order.routes.js";
import createProductRouter from "./routes/product.routes.js";
import createCouponRouter from "./routes/coupon.routes.js";
import createNewsletterRouter from "./routes/newsletter.routes.js";

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

const pool = await connectDB();
const sessionService = createSessionService(pool);

app.use(sessionService.sessionMiddleware);

app.use("/api/auth", createAuthRouter(pool, sessionService));
app.use("/api/admin", createAdminRouter(pool));
app.use("/api/orders", createOrderRouter(pool));
app.use("/api/products", createProductRouter(pool));
app.use("/api/coupons", createCouponRouter(pool));
app.use("/api/newsletter", createNewsletterRouter(pool));

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

import express from "express";
import dotenv from "dotenv";
import { connectMongoDB } from "./config/db.js";
import foodRoutes from "./src/routes/foodRoutes.js";
import createAuthRoutes from "./src/routes/authRoutes.js";
dotenv.config({ path: ".env.development" });

const app = express();
app.use(express.json());

app.use(foodRoutes);

const db = await connectMongoDB();

app.use("/api", createAuthRoutes(db));

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 3001}`);
});

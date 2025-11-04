import express from "express";
import { ObjectId } from "mongodb";
import { connectMongoDB } from "../../config/db.js";
import { validateToken } from "../../services/tokenService.js";

const foodRoutes = express.Router();

//  Middleware to verify Token ti let the user see Producets.
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // Verify The Token in Databse.
    const db = await connectMongoDB();
    const tokenDoc = await validateToken(db, token, "access");

    if (!tokenDoc) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = { id: tokenDoc.userId };
    next();
  } catch (err) {
    console.error("Token validation error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

//#1 - Retrive All, with user verifed Token.
//http://localhost:3001/"Home Page"
foodRoutes.get("/", async (req, res) => {
  try {
    const db = await connectMongoDB();
    const foods = await db.collection("foods").find({}).toArray();

    !foods.length // Advanced if/else (? :)
      ? res.status(404).json({ message: "No foods found" })
      : res.json(foods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//#1 - Retrive One, with user verifed Token.
//http://localhost:3001/:id
foodRoutes.get("/:id", verifyToken, async (req, res) => {
  try {
    const db = await connectMongoDB();
    const food = await db
      .collection("foods")
      .findOne({ _id: new ObjectId(req.params.id) });

    !food // Advanced if/else (? :)
      ? res.status(404).json({ message: "No foods found" })
      : res.json(food);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default foodRoutes;

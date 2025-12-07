import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const DB_CONFIG = {
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "",
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: true,
  },
};

let pool = null;

export async function connectDB() {
  if (pool) return pool;

  if (!DB_CONFIG.database) {
    throw new Error("MYSQL_DATABASE is missing in .env.local");
  }

  try {
    pool = mysql.createPool(DB_CONFIG);
    const connection = await pool.getConnection();
    connection.release();

    console.log("MySQL pool connected successfully");
    return pool;
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
    throw error;
  }
}

export async function closeDB() {
  if (!pool) return;

  try {
    await pool.end();
    console.log("MySQL pool closed");
    pool = null;
  } catch (error) {
    console.error("Error closing database pool:", error.message);
    throw error;
  }
}

export function getDB() {
  if (!pool) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return pool;
}

import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const DB_CONFIG = {
  host: process.env.MYSQL_HOST || "",
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
    throw new Error("MYSQL_DATABASE is not defined in .env file");
  }
  pool = mysql.createPool(DB_CONFIG);
  const conn = await pool.getConnection();
  conn.release();
  console.log("Database pool created.");
  return pool;
}

export async function closeDB() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("Database pool closed.");
  }
}

export function getDB() {
  if (!pool) {
    throw new Error("Database not connected. Call connectDB first.");
  }
  return pool;
}
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const DB_CONFIG = {
  host: process.env.MYSQL_HOST || '',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || '',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || '',
  connectionLimit: 10,          // pool size
  waitForConnections: true,
  queueLimit: 0,
};

let pool = null;

export async function connectMariaDB() {
  if (pool) return pool;
  if (!DB_CONFIG.database) {
    throw new Error('MYSQL_DATABASE is not defined in .env file');
  }
  pool = mysql.createPool(DB_CONFIG);
  // test the pool
  const conn = await pool.getConnection();
  conn.release();
  console.log('MariaDB pool created');
  return pool;
}

export async function closeMariaDB() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('MariaDB pool closed');
  }
}

export function getMariaDB() {
  if (!pool) {
    throw new Error('MariaDB not connected. Call connectMariaDB first.');
  }
  return pool;
}
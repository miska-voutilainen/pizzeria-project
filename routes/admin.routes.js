import express from "express";
import { requireAdmin } from "../middleware/admin.js";

export default function createAdminRouter(pool) {
  const router = express.Router();

  router.get("/users", requireAdmin, async (req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT userId, username, email, firstName, lastName, role, is2faEnabled,
            emailVerified, accountStatus, address, createdAt, lastLoginAt,
            loginCount, failedLoginCount
        FROM user_data ORDER BY createdAt DESC
      `);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  router.put("/users/:userId", requireAdmin, async (req, res) => {
    const { userId } = req.params;
    const {
      username,
      email,
      role,
      accountStatus,
      firstName,
      lastName,
      address,
    } = req.body;

    try {
      await pool.execute(
        `UPDATE user_data
            SET username = ?, email = ?, role = ?, accountStatus = ?, firstName = ?, lastName = ?, address = ?
            WHERE userId = ?`,
        [
          username,
          email,
          role,
          accountStatus,
          firstName,
          lastName,
          address,
          userId,
        ]
      );
      res.json({ message: "User updated" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  router.get("/orders", requireAdmin, async (req, res) => {
    const { userId } = req.query;
    let sql = `
      SELECT o.*, u.username, u.email,
        JSON_UNQUOTE(o.items) as items,
        JSON_UNQUOTE(o.shippingAddress) as shippingAddress
      FROM order_data o
      LEFT JOIN user_data u ON o.userId = u.userId
    `;
    const params = [];
    if (userId) {
      sql += ` WHERE o.userId = ?`;
      params.push(userId);
    }
    sql += ` ORDER BY o.created_at DESC`;

    try {
      const [rows] = await pool.execute(sql, params);
      const parsed = rows.map((r) => ({
        ...r,
        items: r.items ? JSON.parse(r.items) : [],
        shippingAddress: r.shippingAddress
          ? JSON.parse(r.shippingAddress)
          : null,
      }));
      res.json(parsed);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  return router;
}

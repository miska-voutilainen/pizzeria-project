export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "administrator") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

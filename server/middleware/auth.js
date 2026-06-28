const jwt = require("jsonwebtoken");
const config = require("../config");

const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ message: "Token tidak ditemukan" });

  try {
    req.user = jwt.verify(auth.split(" ")[1], config.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token tidak valid atau kadaluarsa" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ message: "Akses ditolak" });
  next();
};

module.exports = { verifyToken, requireRole };

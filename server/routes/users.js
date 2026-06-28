const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../db/connection");
const { verifyToken, requireRole } = require("../middleware/auth");
const config = require("../config");

// GET all users (admin only)
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const users = await db.all2("SELECT id, nama, username, role, avatar, created_at FROM users ORDER BY id");
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create user
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { nama, username, password, role, avatar } = req.body;
    if (!nama || !username || !password || !role)
      return res.status(400).json({ message: "Semua field wajib diisi" });

    const exists = await db.get2("SELECT id FROM users WHERE username=?", [username]);
    if (exists) return res.status(409).json({ message: "Username sudah digunakan" });

    const hash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);
    const result = await db.run2(
      "INSERT INTO users (nama, username, password_hash, role, avatar) VALUES (?,?,?,?,?)",
      [nama, username, hash, role, avatar || nama.substring(0, 2).toUpperCase()]
    );
    res.status(201).json({ id: result.lastID, nama, username, role });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update user
router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { nama, username, password, role, avatar } = req.body;
    const { id } = req.params;

    const user = await db.get2("SELECT * FROM users WHERE id=?", [id]);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    if (username !== user.username) {
      const exists = await db.get2("SELECT id FROM users WHERE username=? AND id!=?", [username, id]);
      if (exists) return res.status(409).json({ message: "Username sudah digunakan" });
    }

    let hash = user.password_hash;
    if (password) hash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

    await db.run2(
      "UPDATE users SET nama=?, username=?, password_hash=?, role=?, avatar=? WHERE id=?",
      [nama, username, hash, role, avatar || nama.substring(0, 2).toUpperCase(), id]
    );
    res.json({ message: "User berhasil diupdate" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE user
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id)
      return res.status(400).json({ message: "Tidak bisa menghapus akun sendiri" });
    await db.run2("DELETE FROM users WHERE id=?", [id]);
    res.json({ message: "User berhasil dihapus" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

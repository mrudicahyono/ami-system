const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {
    res.json(await db.all2("SELECT * FROM prodi ORDER BY nama"));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { kode, nama } = req.body;
    if (!kode || !nama) return res.status(400).json({ message: "Kode dan nama wajib diisi" });
    const exists = await db.get2("SELECT id FROM prodi WHERE kode=?", [kode]);
    if (exists) return res.status(409).json({ message: "Kode prodi sudah ada" });
    const r = await db.run2("INSERT INTO prodi (kode, nama) VALUES (?,?)", [kode, nama]);
    res.status(201).json({ id: r.lastID, kode, nama });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { kode, nama } = req.body;
    const exists = await db.get2("SELECT id FROM prodi WHERE kode=? AND id!=?", [kode, req.params.id]);
    if (exists) return res.status(409).json({ message: "Kode prodi sudah digunakan" });
    await db.run2("UPDATE prodi SET kode=?, nama=? WHERE id=?", [kode, nama, req.params.id]);
    res.json({ message: "Prodi diupdate" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const used = await db.get2("SELECT COUNT(*) as total FROM instrumen WHERE prodi_id=?", [req.params.id]);
    if (used.total > 0)
      return res.status(400).json({ message: `Tidak bisa dihapus — digunakan oleh ${used.total} instrumen` });
    await db.run2("DELETE FROM prodi WHERE id=?", [req.params.id]);
    res.json({ message: "Prodi dihapus" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { verifyToken, requireRole } = require("../middleware/auth");

// GET semua indikator (opsional filter by standar_id)
router.get("/", verifyToken, async (req, res) => {
  try {
    const { standar_id } = req.query;
    let sql = `
      SELECT i.*, s.nama as standar_nama
      FROM indikator i
      JOIN standar s ON i.standar_id = s.id
      WHERE 1=1
    `;
    const params = [];
    if (standar_id) { sql += " AND i.standar_id = ?"; params.push(standar_id); }
    sql += " ORDER BY i.standar_id, i.urutan";
    res.json(await db.all2(sql, params));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST tambah indikator
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { standar_id, kode, deskripsi } = req.body;
    if (!standar_id || !kode || !deskripsi)
      return res.status(400).json({ message: "Standar, kode, dan deskripsi wajib diisi" });
    const exists = await db.get2("SELECT id FROM indikator WHERE kode=? AND standar_id=?", [kode, standar_id]);
    if (exists) return res.status(409).json({ message: "Kode indikator sudah ada di standar ini" });
    const max = await db.get2("SELECT MAX(urutan) as m FROM indikator WHERE standar_id=?", [standar_id]);
    const urutan = (max?.m || 0) + 1;
    const r = await db.run2(
      "INSERT INTO indikator (standar_id, kode, deskripsi, urutan) VALUES (?,?,?,?)",
      [standar_id, kode, deskripsi, urutan]
    );
    res.status(201).json({ id: r.lastID, standar_id, kode, deskripsi, urutan });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update indikator
router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { kode, deskripsi, urutan } = req.body;
    if (!kode || !deskripsi)
      return res.status(400).json({ message: "Kode dan deskripsi wajib diisi" });
    const row = await db.get2("SELECT * FROM indikator WHERE id=?", [req.params.id]);
    if (!row) return res.status(404).json({ message: "Indikator tidak ditemukan" });
    const exists = await db.get2(
      "SELECT id FROM indikator WHERE kode=? AND standar_id=? AND id!=?",
      [kode, row.standar_id, req.params.id]
    );
    if (exists) return res.status(409).json({ message: "Kode indikator sudah digunakan di standar ini" });
    await db.run2(
      "UPDATE indikator SET kode=?, deskripsi=?, urutan=? WHERE id=?",
      [kode, deskripsi, urutan ?? row.urutan, req.params.id]
    );
    res.json({ message: "Indikator diupdate" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE indikator
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const used = await db.get2("SELECT COUNT(*) as total FROM instrumen WHERE indikator_id=?", [req.params.id]);
    if (used.total > 0)
      return res.status(400).json({ message: `Tidak bisa dihapus — digunakan oleh ${used.total} instrumen` });
    await db.run2("DELETE FROM indikator WHERE id=?", [req.params.id]);
    res.json({ message: "Indikator dihapus" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
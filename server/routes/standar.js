const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {
    const rows = await db.all2("SELECT * FROM standar ORDER BY urutan");
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { nama } = req.body;
    if (!nama) return res.status(400).json({ message: "Nama wajib diisi" });
    const max = await db.get2("SELECT MAX(urutan) as m FROM standar");
    const urutan = (max?.m || 0) + 1;
    const r = await db.run2("INSERT INTO standar (nama, urutan) VALUES (?,?)", [nama, urutan]);
    res.status(201).json({ id: r.lastID, nama, urutan });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { nama, urutan } = req.body;
    await db.run2("UPDATE standar SET nama=?, urutan=? WHERE id=?", [nama, urutan, req.params.id]);
    res.json({ message: "Standar diupdate" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const used = await db.get2(
      "SELECT COUNT(*) as total FROM instrumen i JOIN indikator ind ON i.indikator_id = ind.id WHERE ind.standar_id=?",
      [req.params.id]
    );
    if (used.total > 0)
      return res.status(400).json({ message: `Tidak bisa dihapus — digunakan oleh ${used.total} instrumen` });
    await db.run2("DELETE FROM standar WHERE id=?", [req.params.id]);
    res.json({ message: "Standar dihapus" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {
    res.json(await db.all2("SELECT * FROM periode ORDER BY created_at DESC"));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { nama, aktif } = req.body;
    if (!nama || !nama.trim())
      return res.status(400).json({ message: "Nama periode wajib diisi" });
    if (aktif) {
      await db.run2("UPDATE periode SET aktif=0");
    }
    const r = await db.run2(
      "INSERT INTO periode (nama, aktif) VALUES (?,?)",
      [nama.trim(), aktif ? 1 : 0]
    );
    res.status(201).json({ id: r.lastID, nama, aktif: aktif ? 1 : 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { nama, aktif } = req.body;
    if (aktif) {
      await db.run2("UPDATE periode SET aktif=0");
    }
    await db.run2(
      "UPDATE periode SET nama=?, aktif=? WHERE id=?",
      [nama.trim(), aktif ? 1 : 0, req.params.id]
    );
    res.json({ message: "Periode diupdate" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id/toggle", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const row = await db.get2("SELECT * FROM periode WHERE id=?", [req.params.id]);
    if (!row) return res.status(404).json({ message: "Periode tidak ditemukan" });
    if (row.aktif === 0) {
      await db.run2("UPDATE periode SET aktif=0");
      await db.run2("UPDATE periode SET aktif=1 WHERE id=?", [req.params.id]);
    } else {
      await db.run2("UPDATE periode SET aktif=0 WHERE id=?", [req.params.id]);
    }
    res.json({ message: "Status diupdate" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await db.run2("DELETE FROM periode WHERE id=?", [req.params.id]);
    res.json({ message: "Periode dihapus" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
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
    const { nama, tahun, semester } = req.body;
    if (!nama || !tahun || !semester)
      return res.status(400).json({ message: "Semua field wajib diisi" });
    const r = await db.run2(
      "INSERT INTO periode (nama, tahun, semester, status) VALUES (?,?,?,?)",
      [nama, tahun, semester, "draft"]
    );
    res.status(201).json({ id: r.lastID, nama, tahun, semester, status: "draft" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { nama, tahun, semester, status } = req.body;
    if (status === "aktif") {
      await db.run2("UPDATE periode SET status='selesai' WHERE status='aktif'");
    }
    await db.run2(
      "UPDATE periode SET nama=?, tahun=?, semester=?, status=? WHERE id=?",
      [nama, tahun, semester, status, req.params.id]
    );
    res.json({ message: "Periode diupdate" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await db.run2("DELETE FROM periode WHERE id=?", [req.params.id]);
    res.json({ message: "Periode dihapus" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

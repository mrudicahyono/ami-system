const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {
    res.json(await db.all2("SELECT * FROM skor_config ORDER BY nilai"));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { nilai, label, warna, bg_warna } = req.body;
    if (nilai === undefined || nilai === "" || !label)
      return res.status(400).json({ message: "Nilai dan label wajib diisi" });
    const exists = await db.get2("SELECT id FROM skor_config WHERE nilai=?", [nilai]);
    if (exists) return res.status(409).json({ message: "Nilai skor sudah ada" });
    const r = await db.run2(
      "INSERT INTO skor_config (nilai, label, warna, bg_warna) VALUES (?,?,?,?)",
      [nilai, label, warna || "#6B7280", bg_warna || "#F3F4F6"]
    );
    res.status(201).json({ id: r.lastID });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { nilai, label, warna, bg_warna } = req.body;
    if (nilai === undefined || nilai === "" || !label)
      return res.status(400).json({ message: "Nilai dan label wajib diisi" });
    const exists = await db.get2("SELECT id FROM skor_config WHERE nilai=? AND id!=?", [nilai, req.params.id]);
    if (exists) return res.status(409).json({ message: "Nilai skor sudah digunakan" });
    await db.run2(
      "UPDATE skor_config SET nilai=?, label=?, warna=?, bg_warna=? WHERE id=?",
      [nilai, label, warna, bg_warna, req.params.id]
    );
    res.json({ message: "Skor config diupdate" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const row = await db.get2("SELECT nilai FROM skor_config WHERE id=?", [req.params.id]);
    if (!row) return res.status(404).json({ message: "Tidak ditemukan" });
    const used = await db.get2("SELECT COUNT(*) as total FROM evaluasi_auditee WHERE skor=?", [row.nilai]);
    if (used.total > 0)
      return res.status(400).json({ message: `Tidak bisa dihapus — nilai ${row.nilai} sudah digunakan di ${used.total} evaluasi` });
    await db.run2("DELETE FROM skor_config WHERE id=?", [req.params.id]);
    res.json({ message: "Skor dihapus" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
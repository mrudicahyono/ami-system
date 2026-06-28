const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { verifyToken, requireRole } = require("../middleware/auth");

// GET instrumen dengan filter
router.get("/", verifyToken, async (req, res) => {
  try {
    const { standar_id, prodi_id, periode_id } = req.query;
    let sql = `
      SELECT i.*, s.nama as standar_nama,
        ev.skor as skor_auditee, ev.catatan as catatan_auditee, ev.file_path,
        ha.skor as skor_auditor, ha.catatan as catatan_auditor, ha.status
      FROM instrumen i
      JOIN standar s ON i.standar_id = s.id
      LEFT JOIN evaluasi_auditee ev ON ev.instrumen_id = i.id
        AND ev.periode_id = ? AND ev.prodi_id = ?
      LEFT JOIN hasil_audit ha ON ha.instrumen_id = i.id
        AND ha.periode_id = ? AND ha.prodi_id = ?
      WHERE 1=1
    `;
    const params = [periode_id || 0, prodi_id || 0, periode_id || 0, prodi_id || 0];
    if (standar_id) { sql += " AND i.standar_id = ?"; params.push(standar_id); }
    sql += " ORDER BY s.urutan, i.id";
    res.json(await db.all2(sql, params));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create instrumen
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { standar_id, pertanyaan, bobot } = req.body;
    if (!standar_id || !pertanyaan)
      return res.status(400).json({ message: "Standar dan pertanyaan wajib diisi" });
    const r = await db.run2(
      "INSERT INTO instrumen (standar_id, pertanyaan, bobot) VALUES (?,?,?)",
      [standar_id, pertanyaan, bobot || 1]
    );
    res.status(201).json({ id: r.lastID });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update instrumen
router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { standar_id, pertanyaan, bobot } = req.body;
    await db.run2(
      "UPDATE instrumen SET standar_id=?, pertanyaan=?, bobot=? WHERE id=?",
      [standar_id, pertanyaan, bobot || 1, req.params.id]
    );
    res.json({ message: "Instrumen diupdate" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE instrumen
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await db.run2("DELETE FROM instrumen WHERE id=?", [req.params.id]);
    res.json({ message: "Instrumen dihapus" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST evaluasi auditee
router.post("/evaluasi", verifyToken, requireRole("auditee"), async (req, res) => {
  try {
    const { instrumen_id, periode_id, prodi_id, skor, catatan } = req.body;
    const exists = await db.get2(
      "SELECT id FROM evaluasi_auditee WHERE instrumen_id=? AND periode_id=? AND prodi_id=?",
      [instrumen_id, periode_id, prodi_id]
    );
    if (exists) {
      await db.run2(
        "UPDATE evaluasi_auditee SET skor=?, catatan=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
        [skor, catatan, exists.id]
      );
    } else {
      await db.run2(
        "INSERT INTO evaluasi_auditee (instrumen_id, periode_id, prodi_id, user_id, skor, catatan) VALUES (?,?,?,?,?,?)",
        [instrumen_id, periode_id, prodi_id, req.user.id, skor, catatan]
      );
    }
    res.json({ message: "Evaluasi disimpan" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST hasil audit auditor
router.post("/audit", verifyToken, requireRole("auditor"), async (req, res) => {
  try {
    const { instrumen_id, periode_id, prodi_id, skor, catatan, status } = req.body;
    const exists = await db.get2(
      "SELECT id FROM hasil_audit WHERE instrumen_id=? AND periode_id=? AND prodi_id=?",
      [instrumen_id, periode_id, prodi_id]
    );
    if (exists) {
      await db.run2(
        "UPDATE hasil_audit SET skor=?, catatan=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
        [skor, catatan, status || "sesuai", exists.id]
      );
    } else {
      await db.run2(
        "INSERT INTO hasil_audit (instrumen_id, periode_id, prodi_id, auditor_id, skor, catatan, status) VALUES (?,?,?,?,?,?,?)",
        [instrumen_id, periode_id, prodi_id, req.user.id, skor, catatan, status || "sesuai"]
      );
    }
    res.json({ message: "Hasil audit disimpan" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

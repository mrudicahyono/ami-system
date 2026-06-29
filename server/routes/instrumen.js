const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { verifyToken, requireRole } = require("../middleware/auth");

// GET instrumen dengan filter
router.get("/", verifyToken, async (req, res) => {
  try {
    const { standar_id, prodi_id, periode_id, status } = req.query;
    let sql = `
      SELECT i.*,
        s.nama as standar_nama,
        p.kode as prodi_kode, p.nama as prodi_nama,
        u1.nama as auditor1_nama, u2.nama as auditor2_nama, ua.nama as auditee_nama,
        ev.skor as skor_auditee, ev.catatan as catatan_auditee, ev.file_path,
        ha.skor as skor_auditor, ha.catatan as catatan_auditor, ha.status as hasil_status
      FROM instrumen i
      JOIN standar s ON i.standar_id = s.id
      JOIN prodi p ON i.prodi_id = p.id
      LEFT JOIN users u1 ON i.auditor1_id = u1.id
      LEFT JOIN users u2 ON i.auditor2_id = u2.id
      LEFT JOIN users ua ON i.auditee_id = ua.id
      LEFT JOIN evaluasi_auditee ev ON ev.instrumen_id = i.id
        AND ev.periode_id = i.periode_id AND ev.prodi_id = i.prodi_id
      LEFT JOIN hasil_audit ha ON ha.instrumen_id = i.id
        AND ha.periode_id = i.periode_id AND ha.prodi_id = i.prodi_id
      WHERE 1=1
    `;
    const params = [];
    if (standar_id) { sql += " AND i.standar_id = ?"; params.push(standar_id); }
    if (prodi_id)   { sql += " AND i.prodi_id = ?";   params.push(prodi_id); }
    if (periode_id) { sql += " AND i.periode_id = ?"; params.push(periode_id); }
    if (status)     { sql += " AND i.status = ?";     params.push(status); }
    sql += " ORDER BY s.urutan, i.id";
    res.json(await db.all2(sql, params));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create instrumen
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { standar_id, prodi_id, periode_id, auditor1_id, auditor2_id, auditee_id } = req.body;
    if (!standar_id || !prodi_id || !periode_id)
      return res.status(400).json({ message: "Standar, prodi, dan periode wajib diisi" });
    const r = await db.run2(
      "INSERT INTO instrumen (standar_id, prodi_id, periode_id, auditor1_id, auditor2_id, auditee_id) VALUES (?,?,?,?,?,?)",
      [standar_id, prodi_id, periode_id, auditor1_id || null, auditor2_id || null, auditee_id || null]
    );
    res.status(201).json({ id: r.lastID });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update instrumen
router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { standar_id, prodi_id, periode_id, auditor1_id, auditor2_id, auditee_id } = req.body;
    await db.run2(
      "UPDATE instrumen SET standar_id=?, prodi_id=?, periode_id=?, auditor1_id=?, auditor2_id=?, auditee_id=? WHERE id=?",
      [standar_id, prodi_id, periode_id, auditor1_id || null, auditor2_id || null, auditee_id || null, req.params.id]
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
    if (!instrumen_id || !periode_id || !prodi_id)
      return res.status(400).json({ message: "instrumen_id, periode_id, prodi_id wajib diisi" });
    const exists = await db.get2(
      "SELECT id FROM evaluasi_auditee WHERE instrumen_id=? AND periode_id=? AND prodi_id=? AND user_id=?",
      [instrumen_id, periode_id, prodi_id, req.user.id]
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
    if (!instrumen_id || !periode_id || !prodi_id)
      return res.status(400).json({ message: "instrumen_id, periode_id, prodi_id wajib diisi" });
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
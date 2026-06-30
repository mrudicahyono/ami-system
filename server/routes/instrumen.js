const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { verifyToken, requireRole } = require("../middleware/auth");

// GET instrumen dengan filter
router.get("/", verifyToken, async (req, res) => {
  try {
    const { standar_id, indikator_id, prodi_id, periode_id, status } = req.query;
    let sql = `
      SELECT i.*,
        ind.kode as indikator_kode, ind.deskripsi as indikator_deskripsi,
        s.id as standar_id, s.nama as standar_nama,
        p.kode as prodi_kode, p.nama as prodi_nama,
        u1.nama as auditor1_nama, u2.nama as auditor2_nama, ua.nama as auditee_nama,
        ev.skor as skor_auditee, ev.catatan as catatan_auditee, ev.file_path,
        ha.skor as skor_auditor, ha.catatan as catatan_auditor,
        ha.rekomendasi, ha.perlu_rtl, ha.status as hasil_status, 
        tl.status as rtl_status
      FROM instrumen i
      JOIN indikator ind ON i.indikator_id = ind.id
      JOIN standar s ON ind.standar_id = s.id
      JOIN prodi p ON i.prodi_id = p.id
      LEFT JOIN users u1 ON i.auditor1_id = u1.id
      LEFT JOIN users u2 ON i.auditor2_id = u2.id
      LEFT JOIN users ua ON i.auditee_id = ua.id
      LEFT JOIN evaluasi_auditee ev ON ev.instrumen_id = i.id
        AND ev.periode_id = i.periode_id AND ev.prodi_id = i.prodi_id
      LEFT JOIN hasil_audit ha ON ha.instrumen_id = i.id
      LEFT JOIN tindak_lanjut tl ON tl.instrumen_id = i.id
        AND ha.periode_id = i.periode_id AND ha.prodi_id = i.prodi_id
      WHERE 1=1
    `;
    const params = [];
    if (standar_id)   { sql += " AND s.id = ?";           params.push(standar_id); }
    if (indikator_id) { sql += " AND i.indikator_id = ?"; params.push(indikator_id); }
    if (prodi_id)     { sql += " AND i.prodi_id = ?";     params.push(prodi_id); }
    if (periode_id)   { sql += " AND i.periode_id = ?";   params.push(periode_id); }
    if (status)       { sql += " AND i.status = ?";       params.push(status); }
    if (req.user.role === "auditee") {
      sql += " AND i.auditee_id = ?";
      params.push(req.user.id);
    } else if (req.user.role === "auditor") {
      sql += " AND (i.auditor1_id = ? OR i.auditor2_id = ?)";
      params.push(req.user.id, req.user.id);
    }
    sql += " ORDER BY s.urutan, ind.urutan, i.id";
    res.json(await db.all2(sql, params));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create instrumen
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { indikator_id, prodi_id, periode_id, auditor1_id, auditor2_id, auditee_id } = req.body;
    if (!indikator_id || !prodi_id || !periode_id)
      return res.status(400).json({ message: "Indikator, prodi, dan periode wajib diisi" });
    const exists = await db.get2(
      "SELECT id FROM instrumen WHERE indikator_id=? AND prodi_id=? AND periode_id=?",
      [indikator_id, prodi_id, periode_id]
    );
    if (exists) return res.status(409).json({ message: "Instrumen untuk kombinasi ini sudah ada" });
    const r = await db.run2(
      "INSERT INTO instrumen (indikator_id, prodi_id, periode_id, auditor1_id, auditor2_id, auditee_id) VALUES (?,?,?,?,?,?)",
      [indikator_id, prodi_id, periode_id, auditor1_id || null, auditor2_id || null, auditee_id || null]
    );
    res.status(201).json({ id: r.lastID });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update instrumen (admin)
router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { indikator_id, prodi_id, periode_id, auditor1_id, auditor2_id, auditee_id } = req.body;
    await db.run2(
      "UPDATE instrumen SET indikator_id=?, prodi_id=?, periode_id=?, auditor1_id=?, auditor2_id=?, auditee_id=? WHERE id=?",
      [indikator_id, prodi_id, periode_id, auditor1_id || null, auditor2_id || null, auditee_id || null, req.params.id]
    );
    res.json({ message: "Instrumen diupdate" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT evaluasi diri auditee
router.put("/:id/evaluasi", verifyToken, requireRole("auditee"), async (req, res) => {
  try {
    const { deskripsi, file_path } = req.body;
    if (!deskripsi || !deskripsi.trim())
      return res.status(400).json({ message: "Deskripsi evaluasi wajib diisi" });
    const instrumen = await db.get2("SELECT * FROM instrumen WHERE id=?", [req.params.id]);
    if (!instrumen) return res.status(404).json({ message: "Instrumen tidak ditemukan" });
    const exists = await db.get2(
      "SELECT id FROM evaluasi_auditee WHERE instrumen_id=? AND user_id=?",
      [req.params.id, req.user.id]
    );
    if (exists) {
      await db.run2(
        "UPDATE evaluasi_auditee SET skor=?, catatan=?, file_path=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
        [null, deskripsi.trim(), file_path || null, exists.id]
      );
    } else {
      await db.run2(
        "INSERT INTO evaluasi_auditee (instrumen_id, periode_id, prodi_id, user_id, skor, catatan, file_path) VALUES (?,?,?,?,?,?,?)",
        [req.params.id, instrumen.periode_id, instrumen.prodi_id, req.user.id, null, deskripsi.trim(), file_path || null]
      );
    }
    await db.run2("UPDATE instrumen SET status='diisi', updated_at=CURRENT_TIMESTAMP WHERE id=?", [req.params.id]);
    res.json({ message: "Evaluasi disimpan" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT hasil audit auditor
router.put("/:id/audit", verifyToken, requireRole("auditor"), async (req, res) => {
  try {
    const { skor, catatan, rekomendasi, perlu_rtl } = req.body;
    if (skor === undefined || skor === null)
      return res.status(400).json({ message: "Skor wajib diisi" });
    const instrumen = await db.get2("SELECT * FROM instrumen WHERE id=?", [req.params.id]);
    if (!instrumen) return res.status(404).json({ message: "Instrumen tidak ditemukan" });
    const exists = await db.get2(
      "SELECT id FROM hasil_audit WHERE instrumen_id=? AND auditor_id=?",
      [req.params.id, req.user.id]
    );
    if (exists) {
      await db.run2(
        "UPDATE hasil_audit SET skor=?, catatan=?, rekomendasi=?, perlu_rtl=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
        [skor, catatan || null, rekomendasi || null, perlu_rtl ? 1 : 0, "sesuai", exists.id]
      );
    } else {
      await db.run2(
        "INSERT INTO hasil_audit (instrumen_id, periode_id, prodi_id, auditor_id, skor, catatan, rekomendasi, perlu_rtl, status) VALUES (?,?,?,?,?,?,?,?,?)",
        [req.params.id, instrumen.periode_id, instrumen.prodi_id, req.user.id, skor, catatan || null, rekomendasi || null, perlu_rtl ? 1 : 0, "sesuai"]
      );
    }
    await db.run2("UPDATE instrumen SET status='selesai', updated_at=CURRENT_TIMESTAMP WHERE id=?", [req.params.id]);
    res.json({ message: "Hasil audit disimpan" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE instrumen
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await db.run2("DELETE FROM instrumen WHERE id=?", [req.params.id]);
    res.json({ message: "Instrumen dihapus" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET tindak lanjut per instrumen
router.get("/:id/rtl", verifyToken, async (req, res) => {
  try {
    const rows = await db.all2(`
      SELECT tl.*, u.nama as user_nama, v.nama as verifikator_nama
      FROM tindak_lanjut tl
      JOIN users u ON tl.user_id = u.id
      LEFT JOIN users v ON tl.verified_by = v.id
      WHERE tl.instrumen_id = ?
      ORDER BY tl.created_at DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST isi tindak lanjut (auditee)
router.post("/:id/rtl", verifyToken, requireRole("auditee"), async (req, res) => {
  try {
    const { deskripsi, file_path } = req.body;
    if (!deskripsi || !deskripsi.trim())
      return res.status(400).json({ message: "Deskripsi tindak lanjut wajib diisi" });
    const instrumen = await db.get2("SELECT * FROM instrumen WHERE id=?", [req.params.id]);
    if (!instrumen) return res.status(404).json({ message: "Instrumen tidak ditemukan" });
    const existing = await db.get2(
      "SELECT id FROM tindak_lanjut WHERE instrumen_id=? AND user_id=?",
      [req.params.id, req.user.id]
    );
    if (existing) {
      await db.run2(
        "UPDATE tindak_lanjut SET deskripsi=?, file_path=?, status='dilaksanakan', updated_at=CURRENT_TIMESTAMP WHERE id=?",
        [deskripsi.trim(), file_path || null, existing.id]
      );
    } else {
      await db.run2(
        "INSERT INTO tindak_lanjut (instrumen_id, user_id, deskripsi, file_path, status) VALUES (?,?,?,?,?)",
        [req.params.id, req.user.id, deskripsi.trim(), file_path || null, "dilaksanakan"]
      );
    }
    res.json({ message: "Tindak lanjut disimpan" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT verifikasi RTL (auditor/admin)
router.put("/:id/rtl/verifikasi", verifyToken, async (req, res) => {
  try {
    if (!["admin", "auditor"].includes(req.user.role))
      return res.status(403).json({ message: "Tidak diizinkan" });
    const { catatan_verifikasi } = req.body;
    const rtl = await db.get2("SELECT id FROM tindak_lanjut WHERE instrumen_id=?", [req.params.id]);
    if (!rtl) return res.status(404).json({ message: "Tindak lanjut tidak ditemukan" });
    await db.run2(
      "UPDATE tindak_lanjut SET status='diverifikasi', verified_by=?, verified_at=CURRENT_TIMESTAMP, catatan_verifikasi=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
      [req.user.id, catatan_verifikasi || null, rtl.id]
    );
    res.json({ message: "Tindak lanjut diverifikasi" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
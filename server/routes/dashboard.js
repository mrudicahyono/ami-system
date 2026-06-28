const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {
    const { periode_id, prodi_id } = req.query;

    const [totalStandar, totalProdi, totalInstrumen, totalUser] = await Promise.all([
      db.get2("SELECT COUNT(*) as c FROM standar"),
      db.get2("SELECT COUNT(*) as c FROM prodi"),
      db.get2("SELECT COUNT(*) as c FROM instrumen"),
      db.get2("SELECT COUNT(*) as c FROM users"),
    ]);

    let skorPerStandar = [], distribusiStatus = [], progressProdi = [];

    if (periode_id && prodi_id) {
      skorPerStandar = await db.all2(`
        SELECT s.nama as standar, AVG(ha.skor) as rata_skor, COUNT(ha.id) as jumlah
        FROM standar s
        LEFT JOIN instrumen i ON i.standar_id = s.id
        LEFT JOIN hasil_audit ha ON ha.instrumen_id = i.id AND ha.periode_id=? AND ha.prodi_id=?
        GROUP BY s.id ORDER BY s.urutan
      `, [periode_id, prodi_id]);

      distribusiStatus = await db.all2(`
        SELECT status, COUNT(*) as jumlah FROM hasil_audit
        WHERE periode_id=? AND prodi_id=? GROUP BY status
      `, [periode_id, prodi_id]);

      progressProdi = await db.all2(`
        SELECT p.nama as prodi,
          COUNT(ha.id) as sudah_diaudit,
          (SELECT COUNT(*) FROM instrumen) as total_instrumen
        FROM prodi p
        LEFT JOIN hasil_audit ha ON ha.prodi_id = p.id AND ha.periode_id=?
        GROUP BY p.id ORDER BY p.nama
      `, [periode_id]);
    }

    res.json({
      ringkasan: {
        totalStandar: totalStandar.c,
        totalProdi: totalProdi.c,
        totalInstrumen: totalInstrumen.c,
        totalUser: totalUser.c,
      },
      skorPerStandar,
      distribusiStatus,
      progressProdi,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {
    const { prodi_id } = req.query;

    const [totalStandar, totalProdi, totalInstrumen, totalUser] = await Promise.all([
      db.get2("SELECT COUNT(*) as c FROM standar"),
      db.get2("SELECT COUNT(*) as c FROM prodi"),
      db.get2("SELECT COUNT(*) as c FROM instrumen"),
      db.get2("SELECT COUNT(*) as c FROM users"),
    ]);

    const whereProdi = prodi_id ? "AND i.prodi_id = ?" : "";
    const prodiParam = prodi_id ? [prodi_id] : [];

    const [selesai, diisi, proses, belum] = await Promise.all([
      db.get2(`SELECT COUNT(*) as c FROM instrumen i WHERE i.status='selesai' ${whereProdi}`, prodiParam),
      db.get2(`SELECT COUNT(*) as c FROM instrumen i WHERE i.status='diisi' ${whereProdi}`, prodiParam),
      db.get2(`SELECT COUNT(*) as c FROM instrumen i WHERE i.status='proses' ${whereProdi}`, prodiParam),
      db.get2(`SELECT COUNT(*) as c FROM instrumen i WHERE i.status='belum' ${whereProdi}`, prodiParam),
    ]);

    const rataSkorRow = await db.get2(
      `SELECT AVG(ha.skor) as avg FROM hasil_audit ha
       JOIN instrumen i ON i.id = ha.instrumen_id
       WHERE 1=1 ${whereProdi}`, prodiParam
    );

    const skorPerStandar = await db.all2(`
      SELECT s.nama as standar, AVG(ha.skor) as rataSkor, COUNT(ha.id) as jumlahDinilai
      FROM standar s
      LEFT JOIN instrumen i ON i.standar_id = s.id ${prodi_id ? "AND i.prodi_id = ?" : ""}
      LEFT JOIN hasil_audit ha ON ha.instrumen_id = i.id
      GROUP BY s.id ORDER BY s.urutan
    `, prodiParam);

    const statusDistribusi = await db.all2(
      `SELECT status, COUNT(*) as jumlah FROM instrumen i WHERE 1=1 ${whereProdi} GROUP BY status`,
      prodiParam
    );

    const progressPerProdi = await db.all2(`
      SELECT p.kode as prodi_kode, p.nama as prodi,
        COUNT(i.id) as total,
        SUM(CASE WHEN i.status='selesai' THEN 1 ELSE 0 END) as selesai,
        AVG(ha.skor) as rataSkor
      FROM prodi p
      LEFT JOIN instrumen i ON i.prodi_id = p.id
      LEFT JOIN hasil_audit ha ON ha.instrumen_id = i.id
      ${prodi_id ? "WHERE p.id = ?" : ""}
      GROUP BY p.id ORDER BY p.nama
    `, prodiParam);

    const progressPerProdiWithPersen = progressPerProdi.map((p) => ({
      ...p,
      persen: p.total > 0 ? Math.round((p.selesai / p.total) * 100) : 0,
    }));

    res.json({
      ringkasan: {
        totalStandar: totalStandar.c,
        totalProdi: totalProdi.c,
        totalInstrumen: totalInstrumen.c,
        totalUser: totalUser.c,
        selesai: selesai.c,
        diisi: diisi.c,
        proses: proses.c,
        belumDiisi: belum.c,
        rataSkor: rataSkorRow.avg,
      },
      skorPerStandar,
      statusDistribusi,
      progressPerProdi: progressPerProdiWithPersen,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const config = require("../config");

const dbPath = path.resolve(config.DB_PATH);
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) =>
  new Promise((res, rej) =>
    db.run(sql, params, function (err) {
      if (err) return rej(err);
      res({ lastID: this.lastID, changes: this.changes });
    })
  );

const get = (sql, params = []) =>
  new Promise((res, rej) =>
    db.get(sql, params, (err, row) => (err ? rej(err) : res(row)))
  );

async function seed() {
  console.log("🌱 Memulai seed database AMI...");

  // Schema
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  await new Promise((res, rej) => {
    db.serialize(() => {
      db.run("PRAGMA foreign_keys = ON");
      const stmts = schema.split(";").map(s => s.trim()).filter(Boolean);
      stmts.forEach(s => db.run(s));
      db.run("SELECT 1", [], err => err ? rej(err) : res());
    });
  });

  // Standar SN-Dikti
  const standar = [
    "Standar Kompetensi Lulusan",
    "Standar Isi Pembelajaran",
    "Standar Proses Pembelajaran",
    "Standar Penilaian Pembelajaran",
    "Standar Dosen dan Tenaga Kependidikan",
    "Standar Sarana dan Prasarana Pembelajaran",
    "Standar Pengelolaan Pembelajaran",
    "Standar Pembiayaan Pembelajaran",
    "Standar Penelitian dan PKM",
  ];
  for (let i = 0; i < standar.length; i++) {
    const exists = await get("SELECT id FROM standar WHERE nama=?", [standar[i]]);
    if (!exists) await run("INSERT INTO standar (nama, urutan) VALUES (?,?)", [standar[i], i + 1]);
  }
  console.log("✅ Standar SN-Dikti: OK");

  // Prodi
  const prodi = [
    ["PAI", "Pendidikan Agama Islam"],
    ["HES", "Hukum Ekonomi Syariah"],
    ["MPI", "Manajemen Pendidikan Islam"],
    ["PBA", "Pendidikan Bahasa Arab"],
    ["PIAUD", "Pendidikan Islam Anak Usia Dini"],
  ];
  for (const [kode, nama] of prodi) {
    const exists = await get("SELECT id FROM prodi WHERE kode=?", [kode]);
    if (!exists) await run("INSERT INTO prodi (kode, nama) VALUES (?,?)", [kode, nama]);
  }
  console.log("✅ Prodi: OK");

  // Periode
  const periodeExists = await get("SELECT id FROM periode WHERE nama=?", ["AMI 2024/2025 Semester Ganjil"]);
  let periodeId;
  if (!periodeExists) {
    const r = await run("INSERT INTO periode (nama, tahun, semester, status) VALUES (?,?,?,?)", [
      "AMI 2024/2025 Semester Ganjil", "2024/2025", "Ganjil", "aktif"
    ]);
    periodeId = r.lastID;
  } else {
    periodeId = periodeExists.id;
  }
  console.log("✅ Periode: OK");

  // Users
  const users = [
    ["Administrator", "admin", "admin123", "admin", "AD"],
    ["Dr. Ahmad Fauzi, M.Pd", "auditor1", "audit123", "auditor", "AF"],
    ["Ustadz Hasan Basri, M.Ag", "auditor2", "audit123", "auditor", "HB"],
    ["Ketua Prodi PAI", "auditee_pai", "auditee123", "auditee", "KP"],
    ["Ketua Prodi HES", "auditee_hes", "auditee123", "auditee", "KH"],
    ["Ketua Prodi MPI", "auditee_mpi", "auditee123", "auditee", "KM"],
    ["Ketua Prodi PBA", "auditee_pba", "auditee123", "auditee", "KB"],
  ];
  for (const [nama, username, password, role, avatar] of users) {
    const exists = await get("SELECT id FROM users WHERE username=?", [username]);
    if (!exists) {
      const hash = await bcrypt.hash(password, 10);
      await run("INSERT INTO users (nama, username, password_hash, role, avatar) VALUES (?,?,?,?,?)",
        [nama, username, hash, role, avatar]);
    }
  }
  console.log("✅ Users (7): OK");

  // Skor config
  const skorConfig = [
    [0, "Tidak Ada", "#ef4444"],
    [1, "Kurang", "#f97316"],
    [2, "Cukup", "#eab308"],
    [3, "Baik", "#22c55e"],
    [4, "Sangat Baik", "#3b82f6"],
  ];
  for (const [nilai, label, warna] of skorConfig) {
    const exists = await get("SELECT id FROM skor_config WHERE nilai=?", [nilai]);
    if (!exists) await run("INSERT INTO skor_config (nilai, label, warna) VALUES (?,?,?)", [nilai, label, warna]);
  }
  console.log("✅ Skor Config: OK");

  // Instrumen
  const allStandar = await new Promise((res, rej) =>
    db.all("SELECT id, nama FROM standar ORDER BY urutan", [], (err, rows) => err ? rej(err) : res(rows))
  );
  const instrumenData = [
    [0, "Ketersediaan dokumen profil lulusan yang terukur"],
    [0, "Kesesuaian CPL dengan KKNI dan visi misi"],
    [0, "Keterlibatan stakeholder dalam perumusan CPL"],
    [1, "Ketersediaan dokumen kurikulum OBE"],
    [1, "Pemetaan mata kuliah terhadap CPL"],
    [1, "Kesesuaian beban SKS dengan peraturan"],
    [2, "Ketersediaan RPS setiap mata kuliah"],
    [2, "Kesesuaian metode pembelajaran dengan CPL"],
    [2, "Pelaksanaan pembelajaran student-centered"],
    [3, "Ketersediaan rubrik penilaian"],
    [3, "Kesesuaian soal ujian dengan CPL"],
    [3, "Transparansi hasil penilaian kepada mahasiswa"],
    [4, "Kualifikasi akademik dosen (S2/S3)"],
    [4, "Beban kerja dosen sesuai ketentuan"],
    [4, "Pengembangan kompetensi dosen"],
    [5, "Ketersediaan ruang kuliah yang memadai"],
    [5, "Kelengkapan fasilitas laboratorium"],
    [5, "Akses perpustakaan dan e-journal"],
    [6, "Ketersediaan dokumen renstra prodi"],
    [6, "Sistem penjaminan mutu internal prodi"],
    [6, "Keterlaksanaan rapat rutin prodi"],
    [7, "Transparansi pengelolaan keuangan"],
    [7, "Kecukupan dana operasional pembelajaran"],
    [7, "Pertanggungjawaban penggunaan anggaran"],
    [8, "Jumlah publikasi dosen per tahun"],
    [8, "Keterlibatan mahasiswa dalam penelitian"],
    [8, "Kegiatan pengabdian masyarakat berbasis riset"],
  ];

  for (const [standarIdx, pertanyaan] of instrumenData) {
    const standarId = allStandar[standarIdx]?.id;
    if (!standarId) continue;
    const exists = await get("SELECT id FROM instrumen WHERE pertanyaan=?", [pertanyaan]);
    if (!exists) {
      await run("INSERT INTO instrumen (standar_id, pertanyaan, bobot) VALUES (?,?,?)",
        [standarId, pertanyaan, 1]);
    }
  }
  console.log("✅ Instrumen (27): OK");

  console.log("\n🎉 Seed selesai!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Akun login:");
  console.log("  admin     / admin123");
  console.log("  auditor1  / audit123");
  console.log("  auditee_pai / auditee123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  db.close();
}

seed().catch(err => { console.error("❌ Seed error:", err); db.close(); process.exit(1); });

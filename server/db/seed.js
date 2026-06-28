const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const config = require("../config");

const dbPath = path.resolve(config.DB_PATH);
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

async function seed() {
  console.log("🌱 Memulai seed database AMI...");

  // Schema
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);

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
    const exists = db.prepare("SELECT id FROM standar WHERE nama=?").get(standar[i]);
    if (!exists) db.prepare("INSERT INTO standar (nama, urutan) VALUES (?,?)").run(standar[i], i + 1);
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
    const exists = db.prepare("SELECT id FROM prodi WHERE kode=?").get(kode);
    if (!exists) db.prepare("INSERT INTO prodi (kode, nama) VALUES (?,?)").run(kode, nama);
  }
  console.log("✅ Prodi: OK");

  // Periode
  let periodeId;
  const periodeExists = db.prepare("SELECT id FROM periode WHERE nama=?").get("AMI 2024/2025 Semester Ganjil");
  if (!periodeExists) {
    const r = db.prepare("INSERT INTO periode (nama, aktif) VALUES (?,?)").run(
  "AMI 2024/2025 Semester Ganjil", 1
  );
    periodeId = r.lastInsertRowid;
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
    const exists = db.prepare("SELECT id FROM users WHERE username=?").get(username);
    if (!exists) {
      const hash = await bcrypt.hash(password, 10);
      db.prepare("INSERT INTO users (nama, username, password_hash, role, avatar) VALUES (?,?,?,?,?)").run(
        nama, username, hash, role, avatar
      );
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
    const exists = db.prepare("SELECT id FROM skor_config WHERE nilai=?").get(nilai);
    if (!exists) db.prepare("INSERT INTO skor_config (nilai, label, warna) VALUES (?,?,?)").run(nilai, label, warna);
  }
  console.log("✅ Skor Config: OK");

 // Instrumen — buat satu instrumen per kombinasi standar x prodi
  const allProdi = db.prepare("SELECT id FROM prodi").all();
  const periodeRow = db.prepare("SELECT id FROM periode LIMIT 1").get();

  for (const s of allStandar) {
    for (const p of allProdi) {
      const exists = db.prepare("SELECT id FROM instrumen WHERE standar_id=? AND prodi_id=?").get(s.id, p.id);
      if (!exists) {
        db.prepare("INSERT INTO instrumen (standar_id, prodi_id, periode_id, status) VALUES (?,?,?,?)").run(
          s.id, p.id, periodeRow.id, "belum"
        );
      }
    }
  }
  console.log("✅ Instrumen: OK");

  console.log("\n🎉 Seed selesai!");
  console.log("Akun login:");
  console.log("  admin       / admin123");
  console.log("  auditor1    / audit123");
  console.log("  auditee_pai / auditee123");

  db.close();
}

seed().catch(err => { console.error("❌ Seed error:", err); db.close(); process.exit(1); });
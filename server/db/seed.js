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

  // App Config
  const appConfigs = [
    ["upload_max_size_mb", "10", "Batas Ukuran Upload PDF (MB)"],
  ];
  for (const [key, value, label] of appConfigs) {
    const exists = db.prepare("SELECT id FROM app_config WHERE key=?").get(key);
    if (!exists) db.prepare("INSERT INTO app_config (key, value, label) VALUES (?,?,?)").run(key, value, label);
  }
  console.log("✅ App Config: OK");

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

  // Indikator per Standar (contoh 2-3 indikator per standar)
  const allStandar = db.prepare("SELECT id, nama FROM standar ORDER BY urutan").all();
  const indikatorData = {
    "Standar Kompetensi Lulusan": [
      ["SKL-1", "Profil lulusan sesuai dengan visi dan misi program studi"],
      ["SKL-2", "Capaian pembelajaran lulusan (CPL) ditetapkan dan dipublikasikan"],
      ["SKL-3", "CPL mengacu pada KKNI dan SN-Dikti"],
    ],
    "Standar Isi Pembelajaran": [
      ["ISI-1", "Kurikulum disusun berdasarkan CPL yang ditetapkan"],
      ["ISI-2", "Struktur kurikulum mencakup mata kuliah wajib dan pilihan"],
      ["ISI-3", "Beban studi sesuai dengan ketentuan SN-Dikti"],
    ],
    "Standar Proses Pembelajaran": [
      ["PRS-1", "RPS disusun dan disosialisasikan kepada mahasiswa"],
      ["PRS-2", "Proses pembelajaran berpusat pada mahasiswa (SCL)"],
      ["PRS-3", "Monitoring dan evaluasi proses pembelajaran dilakukan secara berkala"],
    ],
    "Standar Penilaian Pembelajaran": [
      ["PNL-1", "Sistem penilaian transparan dan akuntabel"],
      ["PNL-2", "Teknik dan instrumen penilaian sesuai dengan CPL"],
      ["PNL-3", "Hasil penilaian diumumkan kepada mahasiswa tepat waktu"],
    ],
    "Standar Dosen dan Tenaga Kependidikan": [
      ["DTK-1", "Kualifikasi akademik dosen sesuai ketentuan"],
      ["DTK-2", "Rasio dosen dan mahasiswa memenuhi standar"],
      ["DTK-3", "Dosen aktif dalam penelitian dan pengabdian masyarakat"],
    ],
    "Standar Sarana dan Prasarana Pembelajaran": [
      ["SPP-1", "Ruang kuliah memadai dan kondusif untuk pembelajaran"],
      ["SPP-2", "Perpustakaan memiliki koleksi yang relevan dan memadai"],
      ["SPP-3", "Laboratorium dan fasilitas pendukung tersedia"],
    ],
    "Standar Pengelolaan Pembelajaran": [
      ["PGL-1", "Rencana strategis program studi tersedia dan diimplementasikan"],
      ["PGL-2", "Sistem penjaminan mutu internal berjalan efektif"],
      ["PGL-3", "Laporan kinerja program studi disusun secara berkala"],
    ],
    "Standar Pembiayaan Pembelajaran": [
      ["PMB-1", "Anggaran pembelajaran direncanakan dan dikelola secara transparan"],
      ["PMB-2", "Sumber pembiayaan beragam dan mencukupi kebutuhan"],
    ],
    "Standar Penelitian dan PKM": [
      ["PKM-1", "Roadmap penelitian dan PKM tersedia dan diimplementasikan"],
      ["PKM-2", "Dosen dan mahasiswa aktif dalam penelitian dan PKM"],
      ["PKM-3", "Hasil penelitian dipublikasikan di jurnal bereputasi"],
    ],
  };

  for (const s of allStandar) {
    const indikators = indikatorData[s.nama] || [];
    for (let i = 0; i < indikators.length; i++) {
      const [kode, deskripsi] = indikators[i];
      const exists = db.prepare("SELECT id FROM indikator WHERE kode=? AND standar_id=?").get(kode, s.id);
      if (!exists) {
        db.prepare("INSERT INTO indikator (standar_id, kode, deskripsi, urutan) VALUES (?,?,?,?)").run(s.id, kode, deskripsi, i + 1);
      }
    }
  }
  console.log("✅ Indikator: OK");

  // Prodi
  const prodi = [
    ["PAI",   "Pendidikan Agama Islam"],
    ["HES",   "Hukum Ekonomi Syariah"],
    ["MPI",   "Manajemen Pendidikan Islam"],
    ["PBA",   "Pendidikan Bahasa Arab"],
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
    const r = db.prepare("INSERT INTO periode (nama, aktif) VALUES (?,?)").run("AMI 2024/2025 Semester Ganjil", 1);
    periodeId = r.lastInsertRowid;
  } else {
    periodeId = periodeExists.id;
  }
  console.log("✅ Periode: OK");

  // Users
  const users = [
    ["Administrator",          "admin",       "admin123",    "admin",   "AD"],
    ["Dr. Ahmad Fauzi, M.Pd", "auditor1",    "audit123",    "auditor", "AF"],
    ["Ustadz Hasan Basri, M.Ag", "auditor2", "audit123",    "auditor", "HB"],
    ["Ketua Prodi PAI",       "auditee_pai", "auditee123",  "auditee", "KP"],
    ["Ketua Prodi HES",       "auditee_hes", "auditee123",  "auditee", "KH"],
    ["Ketua Prodi MPI",       "auditee_mpi", "auditee123",  "auditee", "KM"],
    ["Ketua Prodi PBA",       "auditee_pba", "auditee123",  "auditee", "KB"],
  ];
  for (const [nama, username, password, role, avatar] of users) {
    const exists = db.prepare("SELECT id FROM users WHERE username=?").get(username);
    if (!exists) {
      const hash = await bcrypt.hash(password, 10);
      db.prepare("INSERT INTO users (nama, username, password_hash, role, avatar) VALUES (?,?,?,?,?)").run(nama, username, hash, role, avatar);
    }
  }
  console.log("✅ Users: OK");

  // Skor config
  const skorConfig = [
    [0, "Tidak Ada", "#ef4444", "#FEE2E2"],
    [1, "Kurang",    "#f97316", "#FFF0E6"],
    [2, "Cukup",     "#eab308", "#FEFCE8"],
    [3, "Baik",      "#22c55e", "#F0FDF4"],
    [4, "Sangat Baik","#3b82f6","#EFF6FF"],
  ];
  for (const [nilai, label, warna, bg_warna] of skorConfig) {
    const exists = db.prepare("SELECT id FROM skor_config WHERE nilai=?").get(nilai);
    if (!exists) db.prepare("INSERT INTO skor_config (nilai, label, warna, bg_warna) VALUES (?,?,?,?)").run(nilai, label, warna, bg_warna);
  }
  console.log("✅ Skor Config: OK");

  // Instrumen — satu per kombinasi indikator x prodi
  const allIndikator = db.prepare("SELECT id FROM indikator").all();
  const allProdi = db.prepare("SELECT id FROM prodi").all();

  for (const ind of allIndikator) {
    for (const p of allProdi) {
      const exists = db.prepare("SELECT id FROM instrumen WHERE indikator_id=? AND prodi_id=? AND periode_id=?").get(ind.id, p.id, periodeId);
      if (!exists) {
        db.prepare("INSERT INTO instrumen (indikator_id, prodi_id, periode_id, status) VALUES (?,?,?,?)").run(ind.id, p.id, periodeId, "belum");
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
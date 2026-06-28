-- Skema database AMI (Audit Mutu Internal)
-- Universitas Islam Tribakti Lirboyo Kediri

PRAGMA foreign_keys = ON;

-- Tabel pengguna sistem
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'auditor', 'auditee')),
  avatar TEXT NOT NULL DEFAULT 'US',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel standar audit (SN-Dikti)
CREATE TABLE IF NOT EXISTS standar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  urutan INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel program studi / unit
CREATE TABLE IF NOT EXISTS prodi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kode TEXT NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel periode audit
CREATE TABLE IF NOT EXISTS periode (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  aktif INTEGER NOT NULL DEFAULT 0 CHECK(aktif IN (0, 1)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel konfigurasi skala skor
CREATE TABLE IF NOT EXISTS skor_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nilai INTEGER NOT NULL UNIQUE CHECK(nilai BETWEEN 0 AND 4),
  label TEXT NOT NULL,
  warna TEXT NOT NULL DEFAULT '#6B7280',
  bg_warna TEXT NOT NULL DEFAULT '#F3F4F6'
);

-- Tabel instrumen audit (penugasan)
CREATE TABLE IF NOT EXISTS instrumen (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  standar_id INTEGER NOT NULL REFERENCES standar(id),
  prodi_id INTEGER NOT NULL REFERENCES prodi(id),
  periode_id INTEGER NOT NULL REFERENCES periode(id),
  auditor1_id INTEGER REFERENCES users(id),
  auditor2_id INTEGER REFERENCES users(id),
  auditee_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'belum' CHECK(status IN ('belum', 'diisi', 'proses', 'selesai')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel evaluasi diri (diisi auditee)
CREATE TABLE IF NOT EXISTS evaluasi_diri (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  instrumen_id INTEGER NOT NULL UNIQUE REFERENCES instrumen(id) ON DELETE CASCADE,
  deskripsi TEXT,
  file_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel hasil audit (diisi auditor)
CREATE TABLE IF NOT EXISTS hasil_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  instrumen_id INTEGER NOT NULL UNIQUE REFERENCES instrumen(id) ON DELETE CASCADE,
  auditor_id INTEGER NOT NULL REFERENCES users(id),
  skor INTEGER CHECK(skor BETWEEN 0 AND 4),
  catatan TEXT,
  rekomendasi TEXT,
  tindak_lanjut TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

# 🏛️ AMI System — Sistem Audit Mutu Internal
### Universitas Islam Tribakti Lirboyo Kediri

Aplikasi web full-stack untuk pelaksanaan Audit Mutu Internal (AMI) berbasis standar SN-Dikti. Dirancang khusus untuk UIT Lirboyo dengan antarmuka SaaS modern yang dapat dikustomisasi sepenuhnya tanpa menulis ulang kode.

---

## ✨ Fitur Utama

- **3 Role Pengguna** — Admin, Auditor, dan Auditee dengan akses masing-masing
- **Dashboard Interaktif** — Bar chart skor per standar, pie chart distribusi status, progress per prodi
- **Manajemen Lengkap** — CRUD standar, prodi, periode, pengguna, dan instrumen audit
- **Form Audit & Evaluasi Diri** — Upload dokumen bukti PDF, skor berwarna, catatan & rekomendasi
- **Filter & Paginasi** — Di semua tabel data
- **Konfigurasi Skor** — Label dan warna skala 0–4 dapat diubah lewat UI
- **Laporan & Export** — Ringkasan audit dan export CSV
- **Self-Configurable** — Semua teks, warna, dan menu dikendalikan dari satu file `config.js`

---

## 🛠 Prasyarat

| Kebutuhan | Versi Minimum |
|-----------|--------------|
| Node.js   | >= 18        |
| npm       | >= 9         |

Tidak memerlukan MySQL, PostgreSQL, atau Docker. Database menggunakan **SQLite** (file lokal).

---

## 🚀 Cara Install & Jalankan (Development)

```bash
# 1. Extract / clone project
cd ami-project

# 2. Install semua dependensi sekaligus
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# 3. Setup environment
cp .env.example .env
```

Edit file `.env`, minimal ganti `JWT_SECRET`:
```env
JWT_SECRET=isi-dengan-string-random-panjang-anda
```

Generate secret secara otomatis:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

```bash
# 4. Buat folder data (untuk database SQLite)
mkdir -p data

# 5. Isi data awal (standar, prodi, pengguna demo, instrumen)
npm run seed

# 6. Jalankan server development
npm run dev
```

Buka browser:
- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:3001/api/health

---

## 👤 Akun Demo

| Role     | Username  | Password    | Keterangan             |
|----------|-----------|-------------|------------------------|
| Admin    | `admin`   | `admin123`  | Akses penuh            |
| Auditor  | `auditor1`| `auditor123`| Audit Standar 1–3      |
| Auditor  | `auditor2`| `auditor123`| Audit Standar 4–6      |
| Auditor  | `auditor3`| `auditor123`| Audit Standar 7–9      |
| Auditee  | `auditee1`| `auditee123`| Prodi PAI & MPI        |
| Auditee  | `auditee2`| `auditee123`| Prodi ES & MES         |
| Auditee  | `auditee3`| `auditee123`| Prodi PGMI             |

---

## 🌐 Cara Deploy ke VPS/Server Production

### Langkah 1 — Build frontend

```bash
# Di mesin lokal
npm run build
# Menghasilkan folder client/dist/
```

### Langkah 2 — Upload ke server

```bash
scp -r ami-project/ user@ip-server:/var/www/ami
# Atau gunakan rsync:
rsync -avz --exclude node_modules ami-project/ user@ip-server:/var/www/ami
```

### Langkah 3 — Setup di server

```bash
ssh user@ip-server
cd /var/www/ami

# Install dependensi production
npm install --omit=dev
cd client && npm install && npm run build && cd ..
cd server && npm install --omit=dev && cd ..

# Buat folder yang dibutuhkan
mkdir -p data uploads logs
```

### Langkah 4 — Environment production

```bash
cp .env.example .env
nano .env
```

Isi `.env` untuk production:
```env
PORT=3001
JWT_SECRET=isi-secret-panjang-dan-acak-di-sini
DB_PATH=./data/ami.db
UPLOAD_DIR=./uploads
CORS_ORIGIN=https://ami.yourdomain.com
NODE_ENV=production
```

### Langkah 5 — Seed database & jalankan

```bash
npm run seed

# Install PM2 (jika belum)
npm install -g pm2

# Jalankan dengan PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup   # Agar otomatis jalan saat server reboot
```

Perintah PM2 berguna lainnya:
```bash
pm2 status          # Cek status proses
pm2 logs ami-server # Lihat log real-time
pm2 restart ami-server
pm2 stop ami-server
```

### Langkah 6 — Konfigurasi Nginx

```bash
# Sesuaikan domain di nginx.conf.example terlebih dahulu
nano nginx.conf.example   # Ganti "ami.yourdomain.com" dan "/var/www/ami"

sudo cp nginx.conf.example /etc/nginx/sites-available/ami
sudo ln -s /etc/nginx/sites-available/ami /etc/nginx/sites-enabled/
sudo nginx -t                   # Test konfigurasi
sudo systemctl restart nginx
```

### Langkah 7 (Opsional) — SSL dengan Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ami.yourdomain.com
# Certbot akan otomatis update konfigurasi Nginx untuk HTTPS
```

### Alternatif: Satu Server Tanpa Nginx

Jika `NODE_ENV=production`, Express secara otomatis melayani frontend dari `client/dist/`. Cukup jalankan:
```bash
pm2 start ecosystem.config.js --env production
# Akses: http://ip-server:3001
```

---

## 🎨 Panduan Kustomisasi TANPA Bantuan Claude

Semua pengaturan tampilan terpusat di **`client/src/config.js`**.

| Mau ubah apa?             | File                      | Bagian                           |
|---------------------------|---------------------------|----------------------------------|
| Nama kampus & logo        | `client/src/config.js`    | `namaUniversitas`, `logoEmoji`   |
| Warna tema seluruh app    | `client/src/config.js`    | `theme` object                   |
| Menu sidebar              | `client/src/config.js`    | `menu.admin/auditor/auditee`     |
| Label tombol & teks UI    | `client/src/config.js`    | `labels` object                  |
| Kartu summary dashboard   | `client/src/config.js`    | `summaryCards` object            |
| Ukuran pagination         | `client/src/config.js`    | `pageSize`, `defaultPageSize`    |
| Standar audit (SN-Dikti)  | UI Admin                  | Menu → Kelola Standar            |
| Program studi / unit      | UI Admin                  | Menu → Kelola Prodi/Unit         |
| Periode audit             | UI Admin                  | Menu → Kelola Periode            |
| Pengguna & role           | UI Admin                  | Menu → Kelola Pengguna           |
| Skala skor & warna badge  | UI Admin                  | Menu → Konfigurasi Skor          |
| Penugasan instrumen       | UI Admin                  | Menu → Kelola Instrumen          |
| Port server backend       | `.env`                    | `PORT`                           |
| JWT secret key            | `.env`                    | `JWT_SECRET`                     |
| Lokasi database SQLite    | `.env`                    | `DB_PATH`                        |
| Folder upload PDF         | `.env`                    | `UPLOAD_DIR`                     |

### Contoh: Ganti nama kampus dan warna tema

Buka `client/src/config.js`, ubah:
```js
const CONFIG = {
  namaUniversitas: "Universitas Contoh Saya",   // ← ganti ini
  logoEmoji: "🎓",                               // ← ganti emoji

  theme: {
    primary: "#7C3AED",                          // ← ungu sebagai contoh
    primaryLight: "#EDE9FE",
    primaryDark: "#5B21B6",
    // ... warna lain bisa dibiarkan
  },
};
```
Simpan → aplikasi otomatis memperbarui semua warna.

---

## 📁 Struktur API

| Method | Endpoint                    | Akses          | Keterangan                  |
|--------|-----------------------------|----------------|-----------------------------|
| POST   | `/api/auth/login`           | Publik         | Login, dapat JWT token      |
| GET    | `/api/auth/me`              | Semua role     | Info user yang login        |
| GET    | `/api/dashboard`            | Semua role     | Data statistik dashboard    |
| GET    | `/api/standar`              | Semua role     | Daftar standar              |
| POST   | `/api/standar`              | Admin          | Tambah standar              |
| PUT    | `/api/standar/:id`          | Admin          | Edit standar                |
| DELETE | `/api/standar/:id`          | Admin          | Hapus standar               |
| GET    | `/api/prodi`                | Semua role     | Daftar prodi/unit           |
| POST   | `/api/prodi`                | Admin          | Tambah prodi                |
| GET    | `/api/periode`              | Semua role     | Daftar periode              |
| PUT    | `/api/periode/:id/toggle`   | Admin          | Aktifkan/nonaktifkan        |
| GET    | `/api/users`                | Admin          | Daftar pengguna             |
| GET    | `/api/skor-config`          | Semua role     | Konfigurasi skala skor      |
| PUT    | `/api/skor-config/:id`      | Admin          | Edit label/warna skor       |
| GET    | `/api/instrumen`            | Role-filtered  | Daftar instrumen (difilter) |
| POST   | `/api/instrumen`            | Admin          | Buat instrumen baru         |
| PUT    | `/api/instrumen/:id/evaluasi` | Auditee      | Isi evaluasi diri           |
| PUT    | `/api/instrumen/:id/audit`  | Auditor        | Isi hasil audit             |
| POST   | `/api/upload`               | Auditee        | Upload PDF (max 10MB)       |
| GET    | `/api/health`               | Publik         | Cek status server           |

---

## 🐛 Troubleshooting

| Error / Gejala                          | Penyebab & Solusi                                              |
|-----------------------------------------|----------------------------------------------------------------|
| `EADDRINUSE: port 3001 already in use`  | Port sudah dipakai. Ganti `PORT` di `.env` atau kill prosesnya: `lsof -ti:3001 \| xargs kill` |
| `SQLITE_CANTOPEN: unable to open database` | Folder `data/` belum ada. Jalankan: `mkdir -p data`        |
| `401 Unauthorized` di semua request     | Token JWT expired. Logout lalu login ulang.                    |
| Halaman kosong setelah `npm run build`  | SPA fallback belum aktif. Pastikan Nginx `try_files` sudah benar. |
| Upload PDF gagal                        | Cek folder `uploads/` ada dan writable: `chmod 755 uploads`   |
| `Cannot find module 'better-sqlite3'`   | Dependensi belum install. Jalankan: `cd server && npm install` |
| Frontend tidak bisa konek ke API (dev)  | Cek `vite.config.js` proxy ke port yang benar (default 3001)  |
| PM2 process crash terus                 | Cek log: `pm2 logs ami-server --lines 50`                      |
| Nginx `502 Bad Gateway`                 | Backend tidak jalan. Cek: `pm2 status` dan `pm2 restart ami-server` |

---

## 🏗 Arsitektur Teknis

```
Browser (React + Vite)
    │
    ├── /api/*  ──→  Express.js (port 3001)
    │                   ├── JWT Auth Middleware
    │                   ├── Routes: auth, instrumen, dashboard, ...
    │                   └── better-sqlite3 (data/ami.db)
    │
    └── /uploads/*  ──→  File statis PDF
```

**Stack:**
- **Frontend**: React 18 + Vite 5, React Router 6, Recharts, Axios
- **Backend**: Express.js, better-sqlite3, jsonwebtoken, bcryptjs, multer
- **Deploy**: PM2 (process manager) + Nginx (reverse proxy)

---

## 📄 Lisensi

Dikembangkan untuk keperluan internal **Universitas Islam Tribakti Lirboyo Kediri**.  
Lembaga Penjaminan Mutu (LPM) — 2025.


// ================================================================
// Entry point server Express.js — AMI Sistem UIT Lirboyo
// ================================================================
const express = require("express");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");
require("dotenv").config();

const config = require("./config");

const app = express();

// ─── Middleware Global ────────────────────────────────────────────────────────

// CORS: izinkan request dari frontend
app.use(cors({
  origin: config.CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Parse JSON body
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Buat folder uploads jika belum ada
const uploadDir = path.resolve(config.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

// ─── Inisialisasi Database ──────────────────
const db = require("./db/connection");

// Auto-seed jika database kosong
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
if (userCount.count === 0) {
  console.log("[SERVER] 🌱 Database kosong, menjalankan seed otomatis...");
  require("./db/seed");
}

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth",       require("./routes/auth"));
app.use("/api/users",      require("./routes/users"));
app.use("/api/standar",    require("./routes/standar"));
app.use("/api/prodi",      require("./routes/prodi"));
app.use("/api/periode",    require("./routes/periode"));
app.use("/api/skor-config",require("./routes/skorConfig"));
app.use("/api/instrumen",  require("./routes/instrumen"));
app.use("/api/upload",     require("./routes/upload"));
app.use("/api/dashboard",  require("./routes/dashboard"));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status:    "ok",
      message:   "Server AMI berjalan dengan baik.",
      env:       process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    },
  });
});

// ─── Production: Serve Frontend Build ────────────────────────────────────────
// Jika NODE_ENV=production, Express juga menghidangkan file Vite build
// Sehingga tidak perlu Nginx terpisah untuk frontend (opsional)
if (process.env.NODE_ENV === "production") {
  const distDir = path.resolve(__dirname, "../client/dist");
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir, {
      maxAge: "1y",
      // HTML tidak di-cache lama agar update langsung terasa
      setHeaders(res, filePath) {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache");
        }
      },
    }));

    // Semua route non-API → kirim index.html (SPA fallback)
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
        return next();
      }
      res.sendFile(path.join(distDir, "index.html"));
    });

    console.log(`[SERVER] 📦 Frontend statis dihidangkan dari: ${distDir}`);
  } else {
    console.warn("[SERVER] ⚠️  Folder client/dist tidak ditemukan. Jalankan: npm run build");
  }
}

// ─── 404 Handler (hanya untuk API) ───────────────────────────────────────────
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.path} tidak ditemukan.`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[SERVER] Error:", err.message || err);
  const isDev = process.env.NODE_ENV !== "production";
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Terjadi kesalahan internal server.",
    ...(isDev && { stack: err.stack }),
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = config.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n[SERVER] ✅ AMI Server aktif di port ${PORT}`);
  console.log(`[SERVER]    Mode:      ${process.env.NODE_ENV || "development"}`);
  console.log(`[SERVER]    CORS:      ${config.CORS_ORIGIN}`);
  console.log(`[SERVER]    Upload:    ${uploadDir}`);
  if (process.env.NODE_ENV !== "production") {
    console.log(`[SERVER]    API:       http://localhost:${PORT}/api`);
    console.log(`[SERVER]    Health:    http://localhost:${PORT}/api/health\n`);
  }
});

module.exports = app;

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db/connection");
const { verifyToken } = require("../middleware/auth");
const config = require("../config");

const uploadDir = path.resolve(config.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Hanya file PDF yang diizinkan"));
  },
});

router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File tidak ditemukan" });
    const { instrumen_id, periode_id, prodi_id } = req.body;
    await db.run2(
      "UPDATE evaluasi_auditee SET file_path=? WHERE instrumen_id=? AND periode_id=? AND prodi_id=?",
      [req.file.filename, instrumen_id, periode_id, prodi_id]
    );
    res.json({ filename: req.file.filename, message: "File berhasil diupload" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/:filename", verifyToken, (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File tidak ditemukan" });
  res.sendFile(filePath);
});

module.exports = router;

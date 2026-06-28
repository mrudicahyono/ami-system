// Konfigurasi server AMI - Universitas Islam Tribakti Lirboyo Kediri
module.exports = {
  PORT: process.env.PORT || 3001,
  JWT_SECRET: process.env.JWT_SECRET || "ami-tribakti-secret-key-ganti-ini",
  JWT_EXPIRES: "24h",
  DB_PATH: process.env.DB_PATH || "./data/ami.db",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  BCRYPT_ROUNDS: 10,
};

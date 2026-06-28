// ================================================================
// PM2 Ecosystem Config — AMI System Production
// Penggunaan:
//   pm2 start ecosystem.config.js --env production
//   pm2 save
//   pm2 startup
// ================================================================

module.exports = {
  apps: [
    {
      name: "ami-server",
      script: "./server/index.js",
      cwd: "/var/www/ami",         // Sesuaikan dengan path deploy Anda

      // Mode cluster untuk multi-core (opsional, ganti ke "fork" jika SQLite bermasalah)
      instances: 1,
      exec_mode: "fork",

      // Restart otomatis jika crash
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",

      // Log
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      out_file: "./logs/ami-out.log",
      error_file: "./logs/ami-error.log",
      merge_logs: true,

      // Environment development
      env: {
        NODE_ENV: "development",
        PORT: 3001,
      },

      // Environment production — aktifkan dengan --env production
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
        // JWT_SECRET, DB_PATH, dll dibaca dari file .env
      },
    },
  ],
};

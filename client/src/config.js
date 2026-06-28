// ================================================================
// CONFIG UTAMA AMI SYSTEM - UIT LIRBOYO
// ================================================================
const CONFIG = {
  namaUniversitas: "Universitas Islam Tribakti Lirboyo",
  namaAplikasi: "AMI System",
  tagline: "Sistem Audit Mutu Internal",
  logoEmoji: "🏛️",
  apiBaseUrl: "/api",
  tokenKey: "ami_token",

  theme: {
    primary: "#2563EB",
    primaryLight: "#EFF6FF",
    primaryDark: "#1D4ED8",
    success: "#16A34A",
    successLight: "#F0FDF4",
    warning: "#F59E0B",
    warningLight: "#FFFBEB",
    danger: "#DC2626",
    dangerLight: "#FEF2F2",
    info: "#3B82F6",
    bgPage: "#F1F5F9",
    bgCard: "#FFFFFF",
    bgSidebar: "#FFFFFF",
    bgTableHeader: "#F8FAFC",
    textPrimary: "#1E293B",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",
    border: "#E5E7EB",
    shadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
    shadowMd: "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)",
    radius: "16px",
    radiusSm: "10px",
    radiusPill: "20px",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },

  menu: {
    admin: [
      { key: "dashboard", label: "Dashboard",          icon: "📊", path: "/admin/dashboard" },
      { key: "instrumen", label: "Kelola Instrumen",   icon: "📋", path: "/admin/instrumen" },
      { key: "standar",   label: "Kelola Standar",     icon: "📐", path: "/admin/standar" },
      { key: "prodi",     label: "Kelola Prodi/Unit",  icon: "🏫", path: "/admin/prodi" },
      { key: "periode",   label: "Kelola Periode",     icon: "📅", path: "/admin/periode" },
      { key: "users",     label: "Kelola Pengguna",    icon: "👥", path: "/admin/users" },
      { key: "skor",      label: "Konfigurasi Skor",   icon: "⚙️", path: "/admin/skor" },
      { key: "laporan",   label: "Laporan & Analitik", icon: "📈", path: "/admin/laporan" },
    ],
    auditor: [
      { key: "dashboard", label: "Dashboard",          icon: "📊", path: "/auditor/dashboard" },
      { key: "instrumen", label: "Instrumen Audit",    icon: "📋", path: "/auditor/instrumen" },
    ],
    auditee: [
      { key: "dashboard", label: "Dashboard",          icon: "📊", path: "/auditee/dashboard" },
      { key: "instrumen", label: "Evaluasi Diri",      icon: "📋", path: "/auditee/instrumen" },
    ],
  },

  summaryCards: {
    admin: [
      { key: "totalInstrumen", label: "Total Instrumen", icon: "📋", color: "info" },
      { key: "selesai",        label: "Selesai Diaudit", icon: "✅", color: "success" },
      { key: "rataSkor",       label: "Rata-rata Skor",  icon: "⭐", color: "warning" },
      { key: "belumDiisi",     label: "Belum Diisi",     icon: "⏳", color: "danger" },
    ],
    auditor: [
      { key: "totalInstrumen", label: "Ditugaskan",      icon: "📋", color: "info" },
      { key: "selesai",        label: "Selesai",         icon: "✅", color: "success" },
      { key: "rataSkor",       label: "Rata-rata Skor",  icon: "⭐", color: "warning" },
      { key: "belumDiisi",     label: "Belum Diaudit",   icon: "⏳", color: "danger" },
    ],
    auditee: [
      { key: "totalInstrumen", label: "Total Instrumen", icon: "📋", color: "info" },
      { key: "diisi",          label: "Sudah Diisi",     icon: "✅", color: "success" },
      { key: "belumDiisi",     label: "Belum Diisi",     icon: "⏳", color: "danger" },
      { key: "selesai",        label: "Selesai (Final)", icon: "🏆", color: "success" },
    ],
  },

  labels: {
    loginTitle: "Masuk ke Sistem AMI",
    loginSubtitle: "Audit Mutu Internal — Universitas Islam Tribakti Lirboyo",
    loginButton: "Masuk",
    logoutButton: "Keluar",
    greeting: "Selamat datang kembali",
    searchPlaceholder: "Cari instrumen, standar, prodi...",
    noData: "Belum ada data",
    simpan: "Simpan",
    batal: "Batal",
    tambah: "Tambah Baru",
    edit: "Edit",
    hapus: "Hapus",
    detail: "Lihat Detail",
    audit: "Isi Audit",
    evaluasi: "Isi Evaluasi Diri",
    uploadPdf: "Upload Bukti (PDF)",
    catatan: "Catatan Auditor",
    rekomendasi: "Rekomendasi",
    tindakLanjut: "Tindak Lanjut",
    confirmHapus: "Yakin ingin menghapus data ini?",
  },

  pageSize: [10, 25, 50],
  defaultPageSize: 10,
};

export default CONFIG;

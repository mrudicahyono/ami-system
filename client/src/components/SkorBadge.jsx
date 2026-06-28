// Badge skor audit dengan warna dari API skor_config
import React from "react";
import CONFIG from "../config.js";

const T = CONFIG.theme;

// Fallback warna jika config belum dimuat
const DEFAULT_COLORS = {
  0: { warna: T.textMuted,  bg_warna: T.bgPage,        label: "-" },
  1: { warna: "#DC2626",    bg_warna: "#FEE2E2",        label: "Kurang" },
  2: { warna: "#D97706",    bg_warna: "#FEF3C7",        label: "Cukup" },
  3: { warna: "#2563EB",    bg_warna: "#DBEAFE",        label: "Baik" },
  4: { warna: "#16A34A",    bg_warna: "#DCFCE7",        label: "Sangat Baik" },
};

export default function SkorBadge({ skor, skorConfig = [] }) {
  if (skor === null || skor === undefined) {
    return (
      <span style={{ fontSize: 12, color: T.textMuted }}>-</span>
    );
  }

  // Cari config dari API, fallback ke default
  const cfg = skorConfig.find((s) => s.nilai === skor) || DEFAULT_COLORS[skor] || DEFAULT_COLORS[0];

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: T.radiusPill,
      fontSize: 12, fontWeight: 700,
      background: cfg.bg_warna, color: cfg.warna,
      whiteSpace: "nowrap",
    }}>
      {skor} — {cfg.label}
    </span>
  );
}

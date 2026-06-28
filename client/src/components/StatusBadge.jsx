// Badge status instrumen: pill berwarna
import React from "react";
import CONFIG from "../config.js";

const T = CONFIG.theme;

// Map status ke warna & label
const STATUS_MAP = {
  belum:   { bg: T.bgPage,       color: T.textMuted,      label: "Belum Diisi" },
  diisi:   { bg: "#FEF3C7",      color: "#92400E",         label: "Sudah Diisi" },
  proses:  { bg: "#DBEAFE",      color: "#1E40AF",         label: "Proses Audit" },
  selesai: { bg: T.successLight, color: T.success,         label: "Selesai" },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || { bg: T.bgPage, color: T.textMuted, label: status || "-" };

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: T.radiusPill,
      fontSize: 12, fontWeight: 600,
      background: cfg.bg, color: cfg.color,
      whiteSpace: "nowrap",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: cfg.color, flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
}

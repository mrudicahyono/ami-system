// SummaryCard: kartu statistik ringkasan dashboard
import React from "react";
import CONFIG from "../config.js";

const T = CONFIG.theme;

const COLOR_MAP = {
  info:    { bg: "#EFF6FF", color: T.info },
  success: { bg: T.successLight, color: T.success },
  warning: { bg: T.warningLight, color: T.warning },
  danger:  { bg: T.dangerLight,  color: T.danger },
};

export default function SummaryCard({ icon, label, value, color = "info", suffix = "" }) {
  const clr = COLOR_MAP[color] || COLOR_MAP.info;

  return (
    <div style={{
      background: T.bgCard, borderRadius: T.radius,
      padding: "20px 24px", boxShadow: T.shadow,
      display: "flex", alignItems: "center", gap: 16,
      flex: 1, minWidth: 0,
    }}>
      {/* Icon circle */}
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        background: clr.bg, color: clr.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, flexShrink: 0,
      }}>
        {icon}
      </div>

      {/* Teks */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, color: T.textSecondary, fontWeight: 500, marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: T.textPrimary, lineHeight: 1 }}>
          {value ?? "—"}
          {suffix && <span style={{ fontSize: 14, fontWeight: 400, color: T.textSecondary, marginLeft: 4 }}>{suffix}</span>}
        </div>
      </div>
    </div>
  );
}

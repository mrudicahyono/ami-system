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

const CARD_ICONS = {
  "📋": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  "✅": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
  "⭐": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  ),
  "⏳": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h14M5 21h14M5 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2"/>
      <path d="M5 21a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2"/>
      <path d="M12 12l4-4M12 12l-4 4"/>
    </svg>
  ),
  "🏆": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
    </svg>
  ),
};

const FallbackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export default function SummaryCard({ icon, label, value, color = "info", suffix = "" }) {
  const clr = COLOR_MAP[color] || COLOR_MAP.info;
  const IconEl = CARD_ICONS[icon] || <FallbackIcon />;

  return (
    <div style={{
      background: T.bgCard, borderRadius: T.radius,
      padding: "20px 24px", boxShadow: T.shadow,
      display: "flex", alignItems: "center", gap: 16,
      flex: 1, minWidth: 0,
      transition: "box-shadow 0.15s ease",
    }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = T.shadowMd}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = T.shadow}
    >
      {/* Icon circle */}
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: clr.bg, color: clr.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {IconEl}
      </div>

      {/* Teks */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, color: T.textSecondary, fontWeight: 500, marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: T.textPrimary, lineHeight: 1 }}>
          {value ?? "—"}
          {suffix && (
            <span style={{ fontSize: 14, fontWeight: 400, color: T.textSecondary, marginLeft: 4 }}>
              {suffix}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
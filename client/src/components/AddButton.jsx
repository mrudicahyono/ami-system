import React from "react";
import CONFIG from "../config.js";
const T = CONFIG.theme;

export default function AddButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px", background: T.primary, color: "#fff",
        border: "none", borderRadius: T.radiusSm, fontSize: 13,
        fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
        display: "flex", alignItems: "center", gap: 6,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      {label || CONFIG.labels.tambah}
    </button>
  );
}
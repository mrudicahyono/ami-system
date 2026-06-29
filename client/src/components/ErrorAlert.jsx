import React from "react";
import CONFIG from "../config.js";
const T = CONFIG.theme;

export default function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div style={{
      padding: "10px 14px", background: T.dangerLight, color: T.danger,
      borderRadius: T.radiusSm, marginBottom: 12,
      display: "flex", alignItems: "center", gap: 8, fontSize: 13,
    }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {message}
    </div>
  );
}
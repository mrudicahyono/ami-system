// Header komponen: greeting, search bar, avatar
import React from "react";
import CONFIG from "../config.js";
import { useAuth } from "../App.jsx";

const T = CONFIG.theme;

export default function Header({ onMenuToggle, searchValue, onSearchChange }) {
  const { user } = useAuth();

  // Dapatkan salam berdasarkan jam
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  };

  return (
    <header style={{
      height: 64, background: T.bgCard,
      borderBottom: `1px solid ${T.border}`,
      display: "flex", alignItems: "center",
      padding: "0 24px", gap: 16,
      position: "sticky", top: 0, zIndex: 30,
      boxShadow: T.shadow,
    }}>
      {/* Tombol hamburger (mobile) */}
      <button
        onClick={onMenuToggle}
        className="hamburger-btn"
        style={{
          width: 36, height: 36, border: "none",
          background: "transparent", cursor: "pointer",
          borderRadius: T.radiusSm, fontSize: 20,
          display: "none", alignItems: "center", justifyContent: "center",
          color: T.textSecondary, flexShrink: 0,
        }}
      >
        ☰
      </button>

      {/* Greeting */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: T.textMuted }}>
          {getGreeting()},
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user?.nama || CONFIG.labels.greeting}
        </div>
      </div>

      {/* Search bar */}
      <div style={{ position: "relative", maxWidth: 320, width: "100%" }} className="search-wrapper">
        <span style={{
          position: "absolute", left: 12, top: "50%",
          transform: "translateY(-50%)", fontSize: 14, color: T.textMuted,
          pointerEvents: "none",
        }}>🔍</span>
        <input
          type="text"
          placeholder={CONFIG.labels.searchPlaceholder}
          value={searchValue || ""}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          style={{
            width: "100%", padding: "8px 12px 8px 36px",
            border: `1px solid ${T.border}`, borderRadius: T.radiusPill,
            fontSize: 13, color: T.textPrimary,
            background: T.bgPage, outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => e.target.style.borderColor = T.primary}
          onBlur={(e) => e.target.style.borderColor = T.border}
        />
      </div>

      {/* Notifikasi dot */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <button style={{
          width: 36, height: 36, border: "none",
          background: T.bgPage, cursor: "pointer",
          borderRadius: "50%", fontSize: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.textSecondary,
        }}>
          🔔
        </button>
        <span style={{
          position: "absolute", top: 4, right: 4,
          width: 8, height: 8, borderRadius: "50%",
          background: T.danger, border: `2px solid ${T.bgCard}`,
        }} />
      </div>

      {/* Avatar user */}
      <div
        title={`${user?.nama} (${user?.role})`}
        style={{
          width: 40, height: 40, borderRadius: "50%",
          background: T.primary, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 700, flexShrink: 0,
          cursor: "default", userSelect: "none",
        }}
      >
        {user?.avatar || "US"}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hamburger-btn { display: flex !important; }
          .search-wrapper { display: none !important; }
        }
      `}</style>
    </header>
  );
}

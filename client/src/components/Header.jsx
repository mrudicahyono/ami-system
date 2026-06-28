import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CONFIG from "../config.js";
import { useAuth } from "../App.jsx";
const T = CONFIG.theme;

export default function Header({ onMenuToggle, searchValue, onSearchChange }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  };

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header style={{
      height: 64, background: T.bgCard,
      borderBottom: `1px solid ${T.border}`,
      display: "flex", alignItems: "center",
      padding: "0 24px", gap: 16,
      position: "sticky", top: 0, zIndex: 30,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      {/* Tombol hamburger */}
      <button
        onClick={onMenuToggle}
        style={{
          width: 36, height: 36, border: "none",
          background: T.bgPage, cursor: "pointer",
          borderRadius: T.radiusSm, fontSize: 18,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.textSecondary, flexShrink: 0,
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = T.border}
        onMouseLeave={(e) => e.currentTarget.style.background = T.bgPage}
      >
        ☰
      </button>

      {/* Greeting */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: T.textMuted }}>{getGreeting()},</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user?.nama || CONFIG.labels.greeting}
        </div>
      </div>

      {/* Search bar */}
      <div style={{ position: "relative", maxWidth: 320, width: "100%" }} className="search-wrapper">
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: T.textMuted, pointerEvents: "none" }}>🔍</span>
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
            transition: "border-color 0.15s", boxSizing: "border-box",
          }}
          onFocus={(e) => e.target.style.borderColor = T.primary}
          onBlur={(e) => e.target.style.borderColor = T.border}
        />
      </div>

      {/* Notifikasi */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <button style={{
          width: 36, height: 36, border: "none",
          background: T.bgPage, cursor: "pointer",
          borderRadius: "50%", fontSize: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.textSecondary, transition: "background 0.15s",
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = T.border}
          onMouseLeave={(e) => e.currentTarget.style.background = T.bgPage}
        >🔔</button>
        <span style={{
          position: "absolute", top: 4, right: 4,
          width: 8, height: 8, borderRadius: "50%",
          background: T.danger, border: `2px solid ${T.bgCard}`,
        }} />
      </div>

      {/* Avatar + Dropdown */}
      <div ref={dropdownRef} style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: T.primary, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, border: "none",
            cursor: "pointer", transition: "opacity 0.15s",
            boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >
          {user?.avatar || "US"}
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div style={{
            position: "absolute", right: 0, top: 48,
            width: 220, background: T.bgCard,
            borderRadius: T.radius, border: `1px solid ${T.border}`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 100, overflow: "hidden",
            animation: "fadeIn 0.15s ease",
          }}>
            {/* Info user */}
            <div style={{
              padding: "16px", borderBottom: `1px solid ${T.border}`,
              background: T.bgPage,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: T.primary, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, flexShrink: 0,
                }}>
                  {user?.avatar || "US"}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{user?.nama}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, textTransform: "capitalize" }}>{user?.role}</div>
                </div>
              </div>
            </div>

            {/* Tombol logout */}
            <button
              onClick={handleLogout}
              style={{
                width: "100%", padding: "12px 16px",
                display: "flex", alignItems: "center", gap: 10,
                border: "none", background: "transparent",
                color: T.danger, fontSize: 13, fontWeight: 500,
                cursor: "pointer", textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = T.dangerLight}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span>🚪</span>
              <span>{CONFIG.labels.logoutButton}</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .search-wrapper { display: none !important; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}
// Sidebar navigasi utama
import React, { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CONFIG from "../config.js";
import { useAuth } from "../App.jsx";

const T = CONFIG.theme;

export default function Sidebar({ collapsed, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = user ? (CONFIG.menu[user.role] || []) : [];

  const handleNav = useCallback((path) => {
    navigate(path);
    if (onClose) onClose();
  }, [navigate, onClose]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const isActive = (path) => location.pathname === path;

  if (collapsed) return null;

  return (
    <>
      {/* Overlay mobile */}
      <div
        onClick={onClose}
        style={{
          display: "none",
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.4)", zIndex: 40,
          "@media (max-width: 768px)": { display: "block" },
        }}
        className="sidebar-overlay"
      />

      <aside style={{
        width: 260, minHeight: "100vh",
        background: T.bgSidebar,
        borderRight: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0,
        zIndex: 50, overflowY: "auto",
        boxShadow: T.shadow,
      }}>
        {/* Logo area */}
        <div style={{
          padding: "24px 20px 20px",
          borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src="https://uit-lirboyo.ac.id/wp-content/uploads/2023/01/logo-UIT-3-1536x1536.png"
                alt="Logo UIT"
                style={{ width: 40, height: 40, borderRadius: T.radiusSm, objectFit: "contain" }}
              />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: T.textPrimary, lineHeight: 1.2 }}>
                {CONFIG.namaAplikasi}
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                {CONFIG.tagline}
              </div>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.path)}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  gap: 10, padding: "9px 12px",
                  borderRadius: T.radiusSm, border: "none",
                  background: active ? T.primaryLight : "transparent",
                  color: active ? T.primary : T.textSecondary,
                  fontWeight: active ? 600 : 400,
                  fontSize: 14, cursor: "pointer",
                  marginBottom: 2, textAlign: "left",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "#F8FAFC";
                    e.currentTarget.style.color = T.textPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = T.textSecondary;
                  }
                }}
              >
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && (
                  <div style={{
                    width: 4, height: 16, borderRadius: 2,
                    background: T.primary,
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div style={{
          padding: "16px 12px",
          borderTop: `1px solid ${T.border}`,
        }}>
          {/* User info */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px", marginBottom: 8,
            background: T.bgPage, borderRadius: T.radiusSm,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: T.primary, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>
              {user?.avatar || "US"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.nama || "-"}
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, textTransform: "capitalize" }}>
                {user?.role || "-"}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-overlay { display: block !important; }
        }
      `}</style>
    </>
  );
}

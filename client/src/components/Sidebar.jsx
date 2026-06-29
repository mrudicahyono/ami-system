// Sidebar navigasi utama
import React, { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CONFIG from "../config.js";
import { useAuth } from "../App.jsx";

const T = CONFIG.theme;

// Icon SVG inline — lebih clean dari emoji
const ICONS = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  instrumen: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/>
    </svg>
  ),
  standar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  ),
  prodi: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
  periode: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  skor: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      <path d="M4.93 4.93a10 10 0 0 0 0 14.14"/>
    </svg>
  ),
  laporan: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
};

// Grouping menu admin
const MENU_GROUPS = {
  admin: [
    {
      label: "Main",
      keys: ["dashboard", "instrumen", "standar", "prodi", "periode"],
    },
    {
      label: "Pengaturan",
      keys: ["users", "skor", "laporan"],
    },
  ],
};

function getIconForKey(key) {
  return ICONS[key] || (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
    </svg>
  );
}

export default function Sidebar({ collapsed, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = user ? (CONFIG.menu[user.role] || []) : [];
  const groups = user?.role === "admin" ? MENU_GROUPS.admin : null;

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

  const renderMenuItem = (item) => {
    const active = isActive(item.path);
    return (
      <button
        key={item.key}
        onClick={() => handleNav(item.path)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: 10, padding: "8px 12px",
          borderRadius: T.radiusSm, border: "none",
          background: active ? T.primaryLight : "transparent",
          color: active ? T.primary : T.textSecondary,
          fontWeight: active ? 600 : 400,
          fontSize: 13.5, cursor: "pointer",
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
        <span style={{
          width: 20, display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          color: active ? T.primary : T.textMuted,
        }}>
          {getIconForKey(item.key)}
        </span>
        <span style={{ flex: 1 }}>{item.label}</span>
        <div style={{
          width: 3, height: 16, borderRadius: 2,
          background: T.primary, flexShrink: 0,
          opacity: active ? 1 : 0,
          transition: "opacity 0.15s ease",
        }} />
      </button>
    );
  };

  const renderMenuWithGroups = () => {
    if (!groups) {
      return menuItems.map(renderMenuItem);
    }
    return groups.map((group) => {
      const items = menuItems.filter((m) => group.keys.includes(m.key));
      if (!items.length) return null;
      return (
        <div key={group.label} style={{ marginBottom: 8 }}>
          <div style={{
            fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em",
            color: T.textMuted, textTransform: "uppercase",
            padding: "6px 12px 4px",
          }}>
            {group.label}
          </div>
          {items.map(renderMenuItem)}
        </div>
      );
    });
  };

  return (
    <>
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
          padding: "20px 20px 16px",
          borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src="https://uit-lirboyo.ac.id/wp-content/uploads/2025/01/android-icon-72x72-1.png"
              alt="Logo UIT"
              style={{ width: 36, height: 36, borderRadius: 8, objectFit: "contain" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: T.textPrimary, lineHeight: 1.2 }}>
                {CONFIG.namaAplikasi}
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                {CONFIG.tagline}
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {renderMenuWithGroups()}
        </nav>

        {/* User info bawah */}
        <div style={{
          padding: "12px 10px",
          borderTop: `1px solid ${T.border}`,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px",
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
            <div style={{ minWidth: 0, flex: 1 }}>
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
// Layout utama: Sidebar + Header + Content area
import React, { useState, useCallback } from "react";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import CONFIG from "../config.js";

const T = CONFIG.theme;

export default function Layout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: T.bgPage, fontFamily: T.fontFamily,
    }}>
      {/* Sidebar desktop (selalu tampil) */}
      <div className="sidebar-desktop" style={{ width: 260, flexShrink: 0 }}>
        <Sidebar collapsed={false} onClose={closeSidebar} />
      </div>

      {/* Sidebar mobile (overlay, toggle) */}
      {sidebarOpen && (
        <div className="sidebar-mobile">
          <div
            onClick={closeSidebar}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.45)", zIndex: 45,
            }}
          />
          <Sidebar collapsed={false} onClose={closeSidebar} />
        </div>
      )}

      {/* Area konten utama */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, marginLeft: 0 }}>
        <Header
          onMenuToggle={toggleSidebar}
          searchValue={search}
          onSearchChange={setSearch}
        />

        {/* Konten halaman */}
        <main style={{ flex: 1, padding: "24px", overflowX: "hidden" }}>
          {title && (
            <h1 style={{
              fontSize: 22, fontWeight: 700, color: T.textPrimary,
              marginBottom: 20, letterSpacing: "-0.3px",
            }}>
              {title}
            </h1>
          )}
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
        }
        @media (min-width: 769px) {
          .sidebar-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}

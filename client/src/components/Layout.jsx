import React, { useState, useCallback } from "react";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import CONFIG from "../config.js";
const T = CONFIG.theme;

export default function Layout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bgPage, fontFamily: T.fontFamily }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 260 : 0,
        flexShrink: 0,
        overflow: "hidden",
        transition: "width 0.25s ease",
      }}>
        {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            display: "none",
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.45)", zIndex: 45,
          }}
        />
      )}

      {/* Konten utama */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header
          onMenuToggle={toggleSidebar}
          searchValue={search}
          onSearchChange={setSearch}
        />
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
          .mobile-overlay { display: block !important; }
        }
      `}</style>
    </div>
  );
}
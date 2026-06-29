import React, { useState, useCallback } from "react";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import CONFIG from "../config.js";
const T = CONFIG.theme;

const SIDEBAR_WIDTH = 260;

export default function Layout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bgPage, fontFamily: T.fontFamily }}>

      {/* Sidebar — fixed, geser pakai transform */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: SIDEBAR_WIDTH, zIndex: 50,
        transform: sidebarOpen ? "translateX(0)" : `translateX(-${SIDEBAR_WIDTH}px)`,
        transition: "transform 0.25s ease",
      }}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
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

      {/* Konten utama — margin kiri menyesuaikan sidebar */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0,
        transition: "margin-left 0.25s ease",
        display: "flex", flexDirection: "column", minWidth: 0,
      }}>
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
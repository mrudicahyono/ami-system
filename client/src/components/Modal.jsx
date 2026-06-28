// Modal overlay reusable
import React, { useEffect } from "react";
import CONFIG from "../config.js";

const T = CONFIG.theme;

export default function Modal({ open, onClose, title, children, wide = false, footer }) {
  // Tutup dengan Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Kunci scroll body saat modal terbuka
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
    >
      <div style={{
        background: T.bgCard,
        borderRadius: T.radius,
        width: "100%", maxWidth: wide ? 720 : 560,
        maxHeight: "90vh", overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        animation: "modalIn 0.15s ease",
      }}>
        {/* Header modal */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary, margin: 0 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, border: "none",
              background: T.bgPage, borderRadius: "50%",
              cursor: "pointer", fontSize: 16, color: T.textSecondary,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = T.border}
            onMouseLeave={(e) => e.currentTarget.style.background = T.bgPage}
          >
            ✕
          </button>
        </div>

        {/* Body modal */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {children}
        </div>

        {/* Footer modal (opsional) */}
        {footer && (
          <div style={{
            padding: "16px 24px",
            borderTop: `1px solid ${T.border}`,
            display: "flex", justifyContent: "flex-end", gap: 8,
            flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

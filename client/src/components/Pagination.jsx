// Komponen paginasi dengan info "Menampilkan X-Y dari Z"
import React from "react";
import CONFIG from "../config.js";

const T = CONFIG.theme;

export default function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.ceil(total / pageSize) || 1;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  const btnStyle = (active) => ({
    minWidth: 32, height: 32, padding: "0 8px",
    border: active ? `1.5px solid ${T.primary}` : `1px solid ${T.border}`,
    borderRadius: T.radiusSm,
    background: active ? T.primary : T.bgCard,
    color: active ? "#fff" : T.textSecondary,
    fontSize: 13, fontWeight: active ? 600 : 400,
    cursor: "pointer", transition: "all 0.15s",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  });

  // Hitung halaman yang ditampilkan
  const pages = [];
  const delta = 1;
  let left = Math.max(2, page - delta);
  let right = Math.min(totalPages - 1, page + delta);

  pages.push(1);
  if (left > 2) pages.push("...");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: 12, marginTop: 16,
    }}>
      {/* Info range */}
      <div style={{ fontSize: 13, color: T.textSecondary }}>
        Menampilkan <strong>{from}</strong>–<strong>{to}</strong> dari <strong>{total}</strong> data
      </div>

      {/* Kontrol halaman */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Page size selector */}
        <select
          value={pageSize}
          onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
          style={{
            padding: "4px 8px", border: `1px solid ${T.border}`,
            borderRadius: T.radiusSm, fontSize: 13,
            color: T.textPrimary, background: T.bgCard,
            cursor: "pointer", marginRight: 8,
          }}
        >
          {CONFIG.pageSize.map((s) => (
            <option key={s} value={s}>{s} / halaman</option>
          ))}
        </select>

        {/* Tombol prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          style={{ ...btnStyle(false), opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? "default" : "pointer" }}
        >
          ‹
        </button>

        {/* Nomor halaman */}
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} style={{ padding: "0 4px", color: T.textMuted }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={btnStyle(p === page)}
            >
              {p}
            </button>
          )
        )}

        {/* Tombol next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          style={{ ...btnStyle(false), opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? "default" : "pointer" }}
        >
          ›
        </button>
      </div>
    </div>
  );
}

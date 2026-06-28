// DataTable reusable dengan empty state dan loading
import React from "react";
import CONFIG from "../config.js";

const T = CONFIG.theme;

export default function DataTable({ columns, data, loading, emptyText }) {
  return (
    <div style={{
      background: T.bgCard, borderRadius: T.radius,
      boxShadow: T.shadow, overflow: "hidden",
    }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  style={{
                    padding: "12px 16px",
                    background: T.bgTableHeader,
                    color: T.textSecondary,
                    fontWeight: 600, fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    textAlign: col.align || "left",
                    whiteSpace: "nowrap",
                    borderBottom: `1px solid ${T.border}`,
                    width: col.width || "auto",
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: "48px 16px", textAlign: "center", color: T.textMuted }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                  Memuat data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: "48px 16px", textAlign: "center", color: T.textMuted }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  {emptyText || CONFIG.labels.noData}
                </td>
              </tr>
            ) : (
              data.map((row, ri) => (
                <tr
                  key={ri}
                  style={{ borderBottom: `1px solid ${T.border}` }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFC"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  {columns.map((col, ci) => (
                    <td
                      key={ci}
                      style={{
                        padding: "12px 16px",
                        color: T.textPrimary,
                        textAlign: col.align || "left",
                        verticalAlign: "middle",
                      }}
                    >
                      {col.render ? col.render(row[col.key], row, ri) : (row[col.key] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// FilterBar: baris filter dropdown
import React from "react";
import CONFIG from "../config.js";

const T = CONFIG.theme;

const selectStyle = {
  padding: "8px 12px",
  border: `1px solid ${T.border}`,
  borderRadius: T.radiusSm,
  fontSize: 13, color: T.textPrimary,
  background: T.bgCard, cursor: "pointer",
  minWidth: 160,
};

export default function FilterBar({ filters, values, onChange, onReset }) {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 10,
      alignItems: "center", marginBottom: 16,
    }}>
      {filters.map((f) => (
        <div key={f.key}>
          {f.type === "select" && (
            <select
              value={values[f.key] || ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              style={selectStyle}
            >
              <option value="">{f.placeholder || `Semua ${f.label}`}</option>
              {(f.options || []).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
          {f.type === "text" && (
            <input
              type="text"
              placeholder={f.placeholder || f.label}
              value={values[f.key] || ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              style={{ ...selectStyle, minWidth: 200 }}
            />
          )}
        </div>
      ))}

      {/* Tombol reset filter */}
      {Object.values(values).some(Boolean) && (
        <button
          onClick={onReset}
          style={{
            padding: "8px 14px",
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusSm,
            background: T.bgCard, color: T.textSecondary,
            fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          ✕ Reset
        </button>
      )}
    </div>
  );
}

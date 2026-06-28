// Laporan & Analitik - Admin
import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from "recharts";
import Layout from "../../components/Layout.jsx";
import CONFIG from "../../config.js";
import api from "../../api.js";

const T = CONFIG.theme;

const STATUS_LABEL = { belum: "Belum Diisi", diisi: "Sudah Diisi", proses: "Proses Audit", selesai: "Selesai" };
const STATUS_COLOR = { belum: "#94A3B8", diisi: "#F59E0B", proses: T.primary, selesai: T.success };

export default function Laporan() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/dashboard");
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data laporan.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = () => {
    // Buat CSV sederhana dari data tabel
    if (!data) return;
    const rows = [
      ["Standar", "Rata-rata Skor", "Jumlah Dinilai"],
      ...(data.skorPerStandar || []).map((s) => [s.standar, s.rataSkor ?? "-", s.jumlahDinilai]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "laporan-ami.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const card = (label, value, icon, color) => (
    <div style={{ background: T.bgCard, borderRadius: T.radius, padding: "16px 20px", boxShadow: T.shadow, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${color}20`, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, color: T.textSecondary, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.textPrimary }}>{value ?? "—"}</div>
      </div>
    </div>
  );

  const r = data?.ringkasan || {};

  return (
    <Layout title="Laporan & Analitik">
      {error && <div style={{ padding: "10px 14px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 16 }}>⚠️ {error}</div>}

      {/* Tombol export */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          onClick={handleExport}
          disabled={!data}
          style={{
            padding: "8px 16px", border: "none", borderRadius: T.radiusSm,
            background: T.success, color: "#fff", fontSize: 13,
            fontWeight: 600, cursor: data ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          ⬇️ Export CSV
        </button>
      </div>

      {/* Ringkasan */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
        {card("Total Instrumen", loading ? "..." : r.totalInstrumen ?? 0, "📋", T.info)}
        {card("Selesai Diaudit", loading ? "..." : r.selesai ?? 0, "✅", T.success)}
        {card("Rata-rata Skor", loading ? "..." : (r.rataSkor != null ? Number(r.rataSkor).toFixed(2) : "0.00"), "⭐", T.warning)}
        {card("Belum Diisi",   loading ? "..." : r.belumDiisi ?? 0, "⏳", T.danger)}
      </div>

      {/* Skor per standar */}
      <div style={{ background: T.bgCard, borderRadius: T.radius, padding: "20px", boxShadow: T.shadow, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: "0 0 16px" }}>Rata-rata Skor per Standar</h3>
        {loading ? (
          <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>Memuat...</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={(data?.skorPerStandar || []).map((s) => ({
                name: s.standar.replace("Standar ", "S"),
                skor: s.rataSkor,
                jumlah: s.jumlahDinilai,
              }))}
              margin={{ top: 20, right: 8, bottom: 4, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.textSecondary }} />
              <YAxis domain={[0, 4]} tick={{ fontSize: 11, fill: T.textSecondary }} />
              <Tooltip
                formatter={(v, n) => [v !== null ? Number(v).toFixed(2) : "-", "Rata-rata Skor"]}
                contentStyle={{ borderRadius: T.radiusSm, border: `1px solid ${T.border}`, fontSize: 12 }}
              />
              <Bar dataKey="skor" fill={T.primary} radius={[4, 4, 0, 0]} label={{ position: "top", fontSize: 11, fill: T.textSecondary, formatter: (v) => v != null ? Number(v).toFixed(1) : "" }}>
                {(data?.skorPerStandar || []).map((_, i) => <Cell key={i} fill={T.primary} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tabel ringkasan + progress prodi */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Tabel skor per standar */}
        <div style={{ background: T.bgCard, borderRadius: T.radius, padding: "20px", boxShadow: T.shadow }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: "0 0 14px" }}>Tabel Skor per Standar</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: T.bgTableHeader }}>
                {["Standar", "Dinilai", "Rata-rata"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} style={{ padding: 20, textAlign: "center", color: T.textMuted }}>Memuat...</td></tr>
              ) : (data?.skorPerStandar || []).map((s, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${T.border}` }}>
                  <td style={{ padding: "8px 12px", color: T.textPrimary }}>{s.standar}</td>
                  <td style={{ padding: "8px 12px", color: T.textSecondary, textAlign: "center" }}>{s.jumlahDinilai}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: T.radiusPill,
                      background: s.rataSkor >= 3 ? T.successLight : s.rataSkor >= 2 ? T.warningLight : T.dangerLight,
                      color: s.rataSkor >= 3 ? T.success : s.rataSkor >= 2 ? T.warning : T.danger,
                      fontSize: 12, fontWeight: 700,
                    }}>
                      {s.rataSkor != null ? Number(s.rataSkor).toFixed(2) : "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Progress per prodi */}
        <div style={{ background: T.bgCard, borderRadius: T.radius, padding: "20px", boxShadow: T.shadow }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: "0 0 14px" }}>Progress Audit per Prodi</h3>
          {loading ? (
            <div style={{ color: T.textMuted }}>Memuat...</div>
          ) : (data?.progressPerProdi || []).map((p, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{p.prodi_kode} — {p.prodi}</span>
                <span style={{ fontSize: 12, color: T.primary, fontWeight: 600 }}>{p.selesai}/{p.total} ({p.persen ?? 0}%)</span>
              </div>
              <div style={{ height: 8, background: T.bgPage, borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 4, width: `${p.persen ?? 0}%`,
                  background: p.persen >= 80 ? T.success : p.persen >= 40 ? T.warning : T.danger,
                  transition: "width 0.5s",
                }} />
              </div>
            </div>
          ))}

          {/* Distribusi status */}
          <div style={{ marginTop: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, margin: "0 0 10px" }}>Distribusi Status</h4>
            {(data?.statusDistribusi || []).map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 13, color: T.textSecondary }}>{STATUS_LABEL[s.status] || s.status}</span>
                <span style={{ padding: "2px 10px", borderRadius: T.radiusPill, background: `${STATUS_COLOR[s.status]}20`, color: STATUS_COLOR[s.status], fontSize: 12, fontWeight: 700 }}>
                  {s.jumlah}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

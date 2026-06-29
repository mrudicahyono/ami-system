// Laporan & Analitik - Admin
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import Layout from "../../components/Layout.jsx";
import CONFIG from "../../config.js";
import api from "../../api.js";

const T = CONFIG.theme;
const STATUS_LABEL = { belum: "Belum Diisi", diisi: "Sudah Diisi", proses: "Proses Audit", selesai: "Selesai" };
const STATUS_COLOR = { belum: "#94A3B8", diisi: "#F59E0B", proses: T.primary, selesai: T.success };

export default function Laporan() {
  const [data, setData]         = useState(null);
  const [prodiList, setProdi]   = useState([]);
  const [prodiId, setProdiId]   = useState("");
  const [prodiNama, setProdiNama] = useState("");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const printRef = useRef(null);

  const fetchProdi = useCallback(async () => {
    try {
      const res = await api.get("/prodi");
      setProdi(res.data || []);
    } catch {}
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = prodiId ? { prodi_id: prodiId } : {};
      const res = await api.get("/dashboard", { params });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data laporan.");
    } finally { setLoading(false); }
  }, [prodiId]);

  useEffect(() => { fetchProdi(); }, [fetchProdi]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleProdiChange = (e) => {
    const val = e.target.value;
    setProdiId(val);
    const found = prodiList.find((p) => String(p.id) === val);
    setProdiNama(found ? `${found.kode} — ${found.nama}` : "Semua Prodi");
  };

  const handleExportPDF = () => {
    const namaProdi = prodiNama || "Semua Prodi";
    const tanggal = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const r = data?.ringkasan || {};

    const rows = (data?.skorPerStandar || []).map((s) => `
      <tr>
        <td>${s.standar}</td>
        <td style="text-align:center">${s.jumlahDinilai}</td>
        <td style="text-align:center; font-weight:700; color:${s.rataSkor >= 3 ? "#16A34A" : s.rataSkor >= 2 ? "#D97706" : s.rataSkor != null ? "#DC2626" : "#94A3B8"}">
          ${s.rataSkor != null ? Number(s.rataSkor).toFixed(2) : "-"}
        </td>
      </tr>
    `).join("");

    const statusRows = (data?.statusDistribusi || []).map((s) => `
      <tr>
        <td>${STATUS_LABEL[s.status] || s.status}</td>
        <td style="text-align:center; font-weight:700">${s.jumlah}</td>
      </tr>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Laporan AMI — ${namaProdi}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 13px; color: #1E293B; margin: 0; padding: 32px; }
          .header { text-align: center; margin-bottom: 28px; border-bottom: 2px solid #16A34A; padding-bottom: 16px; }
          .header h1 { font-size: 18px; margin: 0 0 4px; color: #16A34A; }
          .header h2 { font-size: 14px; margin: 0 0 4px; font-weight: 400; }
          .header p  { font-size: 12px; margin: 0; color: #64748B; }
          .section { margin-bottom: 24px; }
          .section h3 { font-size: 14px; font-weight: 700; margin: 0 0 10px; border-left: 4px solid #16A34A; padding-left: 10px; }
          .cards { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
          .card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px 16px; flex: 1; min-width: 120px; }
          .card .val { font-size: 22px; font-weight: 800; color: #16A34A; }
          .card .lbl { font-size: 11px; color: #64748B; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #F0FDF4; padding: 8px 12px; text-align: left; font-size: 11px; color: #64748B; text-transform: uppercase; border: 1px solid #E5E7EB; }
          td { padding: 8px 12px; border: 1px solid #E5E7EB; }
          tr:nth-child(even) td { background: #F8FAFC; }
          .footer { margin-top: 32px; font-size: 11px; color: #94A3B8; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laporan Audit Mutu Internal</h1>
          <h2>${CONFIG.namaUniversitas}</h2>
          <p>Program Studi / Unit: <strong>${namaProdi}</strong> &nbsp;|&nbsp; Tanggal: ${tanggal}</p>
        </div>

        <div class="section">
          <h3>Ringkasan</h3>
          <div class="cards">
            <div class="card"><div class="val">${r.totalInstrumen ?? 0}</div><div class="lbl">Total Instrumen</div></div>
            <div class="card"><div class="val">${r.selesai ?? 0}</div><div class="lbl">Selesai Diaudit</div></div>
            <div class="card"><div class="val">${r.rataSkor != null ? Number(r.rataSkor).toFixed(2) : "0.00"}</div><div class="lbl">Rata-rata Skor</div></div>
            <div class="card"><div class="val">${r.belumDiisi ?? 0}</div><div class="lbl">Belum Diisi</div></div>
          </div>
        </div>

        <div class="section">
          <h3>Skor per Standar</h3>
          <table>
            <thead><tr><th>Standar</th><th>Jumlah Dinilai</th><th>Rata-rata Skor</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <div class="section">
          <h3>Distribusi Status Instrumen</h3>
          <table>
            <thead><tr><th>Status</th><th>Jumlah</th></tr></thead>
            <tbody>${statusRows}</tbody>
          </table>
        </div>

        <div class="footer">
          Dicetak oleh ${CONFIG.namaAplikasi} — ${CONFIG.namaUniversitas} — ${tanggal}
        </div>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  const r = data?.ringkasan || {};

  const card = (label, value, icon, color) => (
    <div style={{ background: T.bgCard, borderRadius: T.radius, padding: "16px 20px", boxShadow: T.shadow, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${color}20`, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: T.textSecondary, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.textPrimary }}>{value ?? "—"}</div>
      </div>
    </div>
  );

  return (
    <Layout title="Laporan & Analitik">
      {error && <div style={{ padding: "10px 14px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 16 }}>⚠️ {error}</div>}

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary }}>Filter Prodi:</label>
          <select
            value={prodiId}
            onChange={handleProdiChange}
            style={{ padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 13, outline: "none", background: T.bgCard, minWidth: 220 }}
          >
            <option value="">Semua Prodi</option>
            {prodiList.map((p) => <option key={p.id} value={p.id}>{p.kode} — {p.nama}</option>)}
          </select>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={!data}
          style={{ padding: "8px 16px", border: "none", borderRadius: T.radiusSm, background: T.danger, color: "#fff", fontSize: 13, fontWeight: 600, cursor: data ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 6 }}
        >
          📄 Export PDF
        </button>
      </div>

      {/* Label prodi aktif */}
      {prodiId && (
        <div style={{ padding: "8px 14px", background: T.primaryLight, borderRadius: T.radiusSm, marginBottom: 16, fontSize: 13, color: T.primary, fontWeight: 600 }}>
          📂 Menampilkan laporan untuk: {prodiNama}
        </div>
      )}

      {/* Ringkasan */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
        {card("Total Instrumen", loading ? "..." : r.totalInstrumen ?? 0, "📋", T.info)}
        {card("Selesai Diaudit", loading ? "..." : r.selesai ?? 0, "✅", T.success)}
        {card("Rata-rata Skor",  loading ? "..." : (r.rataSkor != null ? Number(r.rataSkor).toFixed(2) : "0.00"), "⭐", T.warning)}
        {card("Belum Diisi",    loading ? "..." : r.belumDiisi ?? 0, "⏳", T.danger)}
      </div>

      {/* Bar chart skor per standar */}
      <div style={{ background: T.bgCard, borderRadius: T.radius, padding: "20px", boxShadow: T.shadow, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: "0 0 16px" }}>Rata-rata Skor per Standar</h3>
        {loading ? (
          <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>Memuat...</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={(data?.skorPerStandar || []).map((s) => ({ name: s.standar.replace("Standar ", "S"), skor: s.rataSkor, fullName: s.standar }))}
              margin={{ top: 20, right: 8, bottom: 4, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.textSecondary }} />
              <YAxis domain={[0, 4]} tick={{ fontSize: 11, fill: T.textSecondary }} />
              <Tooltip
                formatter={(v) => [v !== null ? Number(v).toFixed(2) : "-", "Rata-rata Skor"]}
                labelFormatter={(l, payload) => payload?.[0]?.payload?.fullName || l}
                contentStyle={{ borderRadius: T.radiusSm, border: `1px solid ${T.border}`, fontSize: 12 }}
              />
              <Bar dataKey="skor" fill={T.primary} radius={[4, 4, 0, 0]} label={{ position: "top", fontSize: 11, fill: T.textSecondary, formatter: (v) => v != null ? Number(v).toFixed(1) : "" }}>
                {(data?.skorPerStandar || []).map((_, i) => <Cell key={i} fill={T.primary} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tabel + distribusi status */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
                    <span style={{ padding: "2px 8px", borderRadius: T.radiusPill, background: s.rataSkor >= 3 ? T.successLight : s.rataSkor >= 2 ? T.warningLight : s.rataSkor != null ? T.dangerLight : T.bgPage, color: s.rataSkor >= 3 ? T.success : s.rataSkor >= 2 ? T.warning : s.rataSkor != null ? T.danger : T.textMuted, fontSize: 12, fontWeight: 700 }}>
                      {s.rataSkor != null ? Number(s.rataSkor).toFixed(2) : "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: T.bgCard, borderRadius: T.radius, padding: "20px", boxShadow: T.shadow }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: "0 0 14px" }}>Distribusi Status Instrumen</h3>
          {loading ? <div style={{ color: T.textMuted }}>Memuat...</div> : (data?.statusDistribusi || []).map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 13, color: T.textSecondary }}>{STATUS_LABEL[s.status] || s.status}</span>
              <span style={{ padding: "2px 10px", borderRadius: T.radiusPill, background: `${STATUS_COLOR[s.status]}20`, color: STATUS_COLOR[s.status], fontSize: 12, fontWeight: 700 }}>{s.jumlah}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
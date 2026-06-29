// Dashboard Auditor
import React, { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Layout from "../../components/Layout.jsx";
import SummaryCard from "../../components/SummaryCard.jsx";
import CONFIG from "../../config.js";
import api from "../../api.js";

const T = CONFIG.theme;

export default function AuditorDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/dashboard");
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat dashboard.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const cards = CONFIG.summaryCards.auditor;
  const r = data?.ringkasan || {};

  return (
    <Layout title="Dashboard Auditor">
      {error && <div style={{ padding: "10px 14px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 16 }}>⚠️ {error}</div>}

      {/* Summary cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        {cards.map((card) => (
          <SummaryCard
            key={card.key}
            icon={card.icon} label={card.label} color={card.color}
            value={loading ? "..." : card.key === "rataSkor" ? (r.rataSkor != null ? Number(r.rataSkor).toFixed(2) : "0.00") : (r[card.key] ?? 0)}
            suffix={card.key === "rataSkor" ? "/ 4" : ""}
          />
        ))}
      </div>

      {/* Chart + status */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        <div style={{ background: T.bgCard, borderRadius: T.radius, padding: "20px", boxShadow: T.shadow }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: "0 0 16px" }}>
            Skor Audit per Standar (Penugasan Saya)
          </h3>
          {loading ? (
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>Memuat...</div>
          ) : (data?.skorPerStandar || []).length === 0 ? (
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>Belum ada data skor.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={(data?.skorPerStandar || []).map((s) => ({ name: s.standar.replace("Standar ", "S"), skor: s.rataSkor }))}
                margin={{ top: 20, right: 8, bottom: 4, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.textSecondary }} />
                <YAxis domain={[0, 4]} tick={{ fontSize: 11, fill: T.textSecondary }} />
                <Tooltip
                  formatter={(v) => [v != null ? Number(v).toFixed(2) : "-", "Rata-rata Skor"]}
                  contentStyle={{ borderRadius: T.radiusSm, fontSize: 12 }}
                />
                <Bar dataKey="skor" fill={T.primary} radius={[4, 4, 0, 0]}
                  label={{ position: "top", fontSize: 11, fill: T.textSecondary, formatter: (v) => v != null ? Number(v).toFixed(1) : "" }}>
                  {(data?.skorPerStandar || []).map((_, i) => <Cell key={i} fill={T.primary} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status distribusi */}
        <div style={{ background: T.bgCard, borderRadius: T.radius, padding: "20px", boxShadow: T.shadow }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: "0 0 16px" }}>Status Instrumen Saya</h3>
          {loading ? <div style={{ color: T.textMuted }}>Memuat...</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Selesai Diaudit", key: "selesai",   color: T.success, bg: T.successLight },
                { label: "Proses Audit",    key: "proses",    color: T.primary, bg: T.primaryLight },
                { label: "Evaluasi Masuk",  key: "diisi",     color: T.warning, bg: T.warningLight },
                { label: "Belum Diisi",     key: "belumDiisi",color: T.textMuted, bg: T.bgPage },
              ].map((s) => (
                <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: s.bg, borderRadius: T.radiusSm }}>
                  <span style={{ fontSize: 13, color: s.color, fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{r[s.key] ?? 0}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, padding: "10px 14px", background: T.bgPage, borderRadius: T.radiusSm }}>
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>Rata-rata Skor Anda</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: T.primary }}>
                  {r.rataSkor != null ? Number(r.rataSkor).toFixed(2) : "0.00"} <span style={{ fontSize: 14, fontWeight: 400, color: T.textMuted }}>/ 4</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

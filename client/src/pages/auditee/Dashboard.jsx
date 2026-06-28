// Dashboard Auditee
import React, { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout.jsx";
import SummaryCard from "../../components/SummaryCard.jsx";
import CONFIG from "../../config.js";
import api from "../../api.js";

const T = CONFIG.theme;

export default function AuditeeDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/dashboard");
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat dashboard.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const cards = CONFIG.summaryCards.auditee;
  const r = data?.ringkasan || {};

  return (
    <Layout title="Dashboard">
      {error && <div style={{ padding: "10px 14px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 16 }}>⚠️ {error}</div>}

      {/* Summary cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        {cards.map((card) => (
          <SummaryCard
            key={card.key}
            icon={card.icon} label={card.label} color={card.color}
            value={loading ? "..." : (r[card.key] ?? 0)}
          />
        ))}
      </div>

      {/* Progress per standar */}
      <div style={{ background: T.bgCard, borderRadius: T.radius, padding: "20px", boxShadow: T.shadow, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: "0 0 16px" }}>
          Progress Evaluasi Diri per Standar
        </h3>
        {loading ? (
          <div style={{ color: T.textMuted }}>Memuat...</div>
        ) : (data?.skorPerStandar || []).length === 0 ? (
          <div style={{ color: T.textMuted, padding: 20, textAlign: "center" }}>Belum ada instrumen yang ditugaskan.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {(data?.skorPerStandar || []).map((s, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: T.textPrimary }}>{s.standar}</span>
                  <span style={{ fontSize: 12, color: T.textSecondary }}>
                    {s.jumlahDinilai > 0 ? `Skor: ${Number(s.rataSkor).toFixed(2)}` : "Belum dinilai"}
                  </span>
                </div>
                <div style={{ height: 8, background: T.bgPage, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4,
                    width: s.jumlahDinilai > 0 ? "100%" : "0%",
                    background: s.rataSkor >= 3 ? T.success : s.rataSkor >= 2 ? T.warning : T.danger,
                    transition: "width 0.5s",
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instrumen terbaru */}
      {(data?.instrumenTerbaru || []).length > 0 && (
        <div style={{ background: T.bgCard, borderRadius: T.radius, padding: "20px", boxShadow: T.shadow }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: "0 0 14px" }}>Aktivitas Terbaru</h3>
          {(data.instrumenTerbaru || []).map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 0", borderBottom: i < data.instrumenTerbaru.length - 1 ? `1px solid ${T.border}` : "none",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{item.standar_nama}</div>
                <div style={{ fontSize: 12, color: T.textMuted }}>{item.prodi_nama}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {item.skor != null && (
                  <span style={{ padding: "2px 8px", borderRadius: T.radiusPill, background: T.successLight, color: T.success, fontSize: 12, fontWeight: 700 }}>
                    Skor {item.skor}
                  </span>
                )}
                <span style={{
                  padding: "3px 10px", borderRadius: T.radiusPill, fontSize: 12, fontWeight: 600,
                  background: item.status === "selesai" ? T.successLight : item.status === "diisi" ? T.warningLight : T.bgPage,
                  color: item.status === "selesai" ? T.success : item.status === "diisi" ? T.warning : T.textMuted,
                }}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

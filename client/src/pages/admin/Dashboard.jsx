// Dashboard Admin - statistik AMI
import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import Layout from "../../components/Layout.jsx";
import SummaryCard from "../../components/SummaryCard.jsx";
import CONFIG from "../../config.js";
import api from "../../api.js";

const T = CONFIG.theme;

// Label custom untuk pie chart
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Label di atas bar chart
const CustomBarLabel = ({ x, y, width, value }) => {
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y - 4} fill={T.textSecondary} textAnchor="middle" fontSize={11} fontWeight={600}>
      {value !== null ? Number(value).toFixed(1) : "-"}
    </text>
  );
};

const PIE_COLORS = {
  belum:   "#94A3B8",
  diisi:   "#F59E0B",
  proses:  "#3B82F6",
  selesai: "#16A34A",
};
const PIE_LABELS = { belum: "Belum Diisi", diisi: "Sudah Diisi", proses: "Proses", selesai: "Selesai" };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/dashboard");
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const cards = CONFIG.summaryCards.admin;
  const ringkasan = data?.ringkasan || {};

  return (
    <Layout title="Dashboard">
      {/* Pesan error */}
      {error && (
        <div style={{ padding: "12px 16px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        {cards.map((card) => (
          <SummaryCard
            key={card.key}
            icon={card.icon}
            label={card.label}
            color={card.color}
            value={
              loading ? "..." :
              card.key === "rataSkor"
                ? (ringkasan.rataSkor != null ? Number(ringkasan.rataSkor).toFixed(2) : "0.00")
                : (ringkasan[card.key] ?? 0)
            }
            suffix={card.key === "rataSkor" ? "/ 4" : ""}
          />
        ))}
      </div>

      {/* Baris chart utama */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginBottom: 16 }}>
        {/* Bar chart skor per standar */}
        <div style={{ background: T.bgCard, borderRadius: T.radius, padding: "20px 20px 12px", boxShadow: T.shadow }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, marginBottom: 16, margin: "0 0 16px" }}>
            Rata-rata Skor per Standar SN-Dikti
          </h3>
          {loading ? (
            <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>
              Memuat chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={(data?.skorPerStandar || []).map((s) => ({
                  name: s.standar.replace("Standar ", "S").replace("Penelitian dan Pengabdian Masyarakat", "P&PM"),
                  fullName: s.standar,
                  skor: s.rataSkor,
                }))}
                margin={{ top: 24, right: 8, bottom: 4, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.textSecondary }} />
                <YAxis domain={[0, 4]} tick={{ fontSize: 11, fill: T.textSecondary }} />
                <Tooltip
                  formatter={(v) => [v !== null ? Number(v).toFixed(2) : "-", "Rata-rata Skor"]}
                  labelFormatter={(l, payload) => payload?.[0]?.payload?.fullName || l}
                  contentStyle={{ borderRadius: T.radiusSm, border: `1px solid ${T.border}`, fontSize: 12 }}
                />
                <Bar dataKey="skor" fill={T.primary} radius={[4, 4, 0, 0]} label={<CustomBarLabel />}>
                  {(data?.skorPerStandar || []).map((_, i) => (
                    <Cell key={i} fill={T.primary} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Metrik ringkasan */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            {
              label: "Skor Tertinggi",
              value: loading ? "..." : (() => {
                const items = data?.skorPerStandar?.filter((s) => s.rataSkor != null) || [];
                if (!items.length) return "-";
                const max = items.reduce((a, b) => a.rataSkor > b.rataSkor ? a : b);
                return `${Number(max.rataSkor).toFixed(2)} — ${max.standar.replace("Standar ", "S")}`;
              })(),
              icon: "🏆", color: T.success, bg: T.successLight,
            },
            {
              label: "Skor Terendah",
              value: loading ? "..." : (() => {
                const items = data?.skorPerStandar?.filter((s) => s.rataSkor != null) || [];
                if (!items.length) return "-";
                const min = items.reduce((a, b) => a.rataSkor < b.rataSkor ? a : b);
                return `${Number(min.rataSkor).toFixed(2)} — ${min.standar.replace("Standar ", "S")}`;
              })(),
              icon: "📉", color: T.warning, bg: T.warningLight,
            },
            {
              label: "Progress Selesai",
              value: loading ? "..." : (
                ringkasan.totalInstrumen
                  ? `${Math.round((ringkasan.selesai / ringkasan.totalInstrumen) * 100)}%`
                  : "0%"
              ),
              icon: "📊", color: T.primary, bg: T.primaryLight,
            },
          ].map((m, i) => (
            <div key={i} style={{
              background: T.bgCard, borderRadius: T.radius,
              padding: "16px 20px", boxShadow: T.shadow,
              display: "flex", alignItems: "center", gap: 12, flex: 1,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: m.bg, color: m.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
              }}>
                {m.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, color: T.textSecondary, fontWeight: 500, marginBottom: 2 }}>{m.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{m.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Baris bawah: Pie chart + Progress per prodi */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
        {/* Pie chart distribusi status */}
        <div style={{ background: T.bgCard, borderRadius: T.radius, padding: "20px", boxShadow: T.shadow }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: "0 0 16px" }}>
            Distribusi Status Instrumen
          </h3>
          {loading ? (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>
              Memuat...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={(data?.statusDistribusi || []).filter((s) => s.jumlah > 0).map((s) => ({
                    name: PIE_LABELS[s.status] || s.status,
                    value: s.jumlah,
                    fill: PIE_COLORS[s.status] || "#94A3B8",
                  }))}
                  cx="50%" cy="50%" outerRadius={80}
                  dataKey="value" labelLine={false}
                  label={renderCustomLabel}
                >
                  {(data?.statusDistribusi || []).map((s, i) => (
                    <Cell key={i} fill={PIE_COLORS[s.status] || "#94A3B8"} />
                  ))}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: T.radiusSm, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Progress per prodi */}
        <div style={{ background: T.bgCard, borderRadius: T.radius, padding: "20px", boxShadow: T.shadow }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: "0 0 16px" }}>
            Progress Audit per Program Studi
          </h3>
          {loading ? (
            <div style={{ color: T.textMuted, fontSize: 13 }}>Memuat...</div>
          ) : (data?.progressPerProdi || []).length === 0 ? (
            <div style={{ color: T.textMuted, fontSize: 13 }}>Belum ada data.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(data?.progressPerProdi || []).map((p, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{p.prodi_kode}</span>
                      <span style={{ fontSize: 12, color: T.textSecondary, marginLeft: 6 }}>{p.prodi}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.primary }}>
                      {p.selesai}/{p.total} ({p.persen ?? 0}%)
                    </span>
                  </div>
                  <div style={{ height: 8, background: T.bgPage, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 4,
                      width: `${p.persen ?? 0}%`,
                      background: p.persen >= 80 ? T.success : p.persen >= 40 ? T.warning : T.danger,
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

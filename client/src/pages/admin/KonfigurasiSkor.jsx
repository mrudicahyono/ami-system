// Konfigurasi Skala Skor - Admin
import React, { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout.jsx";
import Modal from "../../components/Modal.jsx";
import CONFIG from "../../config.js";
import api from "../../api.js";

const T = CONFIG.theme;

export default function KonfigurasiSkor() {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({ label: "", warna: "", bg_warna: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/skor-config");
      setData(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openEdit = (row) => {
    setForm({ label: row.label, warna: row.warna, bg_warna: row.bg_warna });
    setModal({ data: row });
  };

  const handleSave = useCallback(async () => {
    if (!form.label.trim()) { setError("Label wajib diisi."); return; }
    setSaving(true); setError("");
    try {
      await api.put(`/skor-config/${modal.data.id}`, {
        label: form.label.trim(),
        warna: form.warna,
        bg_warna: form.bg_warna,
      });
      setModal(null); fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan.");
    } finally { setSaving(false); }
  }, [form, modal, fetchData]);

  const inputStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 13, outline: "none", boxSizing: "border-box" };

  return (
    <Layout title="Konfigurasi Skala Skor">
      {error && <div style={{ padding: "10px 14px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 16 }}>⚠️ {error}</div>}

      <div style={{ background: T.bgCard, borderRadius: T.radius, boxShadow: T.shadow, overflow: "hidden" }}>
        {/* Keterangan */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, background: T.bgTableHeader }}>
          <p style={{ fontSize: 13, color: T.textSecondary, margin: 0 }}>
            Nilai skor (0–4) tidak dapat diubah. Anda hanya dapat mengubah label teks dan warna tampilan.
          </p>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: T.textMuted }}>Memuat...</div>
        ) : (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {data.map((s) => (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "14px 16px", border: `1px solid ${T.border}`,
                borderRadius: T.radiusSm, background: T.bgPage,
              }}>
                {/* Nilai angka */}
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: s.bg_warna, color: s.warna,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 800, flexShrink: 0,
                  border: `2px solid ${s.warna}`,
                }}>
                  {s.nilai}
                </div>

                {/* Label preview */}
                <div style={{ flex: 1 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "4px 14px", borderRadius: T.radiusPill,
                    background: s.bg_warna, color: s.warna,
                    fontSize: 13, fontWeight: 700,
                  }}>
                    {s.nilai} — {s.label}
                  </span>
                </div>

                {/* Swatch warna */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, background: s.warna, border: `1px solid ${T.border}` }} />
                    <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "monospace" }}>{s.warna}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, background: s.bg_warna, border: `1px solid ${T.border}` }} />
                    <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "monospace" }}>{s.bg_warna}</span>
                  </div>
                </div>

                {/* Tombol edit */}
                <button
                  onClick={() => openEdit(s)}
                  style={{
                    padding: "6px 14px", border: "none",
                    borderRadius: T.radiusSm,
                    background: T.primaryLight, color: T.primary,
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  ✏️ {CONFIG.labels.edit}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal edit skor */}
      <Modal
        open={!!modal}
        onClose={() => { setModal(null); setError(""); }}
        title={`Edit Skor ${modal?.data?.nilai} — ${modal?.data?.label}`}
        footer={
          <>
            <button onClick={() => { setModal(null); setError(""); }} style={{ padding: "8px 18px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, background: T.bgCard, fontSize: 13, cursor: "pointer" }}>{CONFIG.labels.batal}</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: "8px 18px", background: T.primary, color: "#fff", border: "none", borderRadius: T.radiusSm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "Menyimpan..." : CONFIG.labels.simpan}
            </button>
          </>
        }
      >
        {error && <div style={{ padding: "8px 12px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 12, fontSize: 13 }}>⚠️ {error}</div>}

        {/* Preview live */}
        {form.warna && form.bg_warna && (
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <span style={{ padding: "6px 18px", borderRadius: T.radiusPill, background: form.bg_warna, color: form.warna, fontSize: 14, fontWeight: 700 }}>
              {modal?.data?.nilai} — {form.label || "Label"}
            </span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Label *</label>
            <input value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} placeholder="Contoh: Sangat Baik" style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Warna Teks</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="color" value={form.warna} onChange={(e) => setForm((p) => ({ ...p, warna: e.target.value }))} style={{ width: 44, height: 36, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, cursor: "pointer", padding: 2 }} />
                <input value={form.warna} onChange={(e) => setForm((p) => ({ ...p, warna: e.target.value }))} placeholder="#000000" style={{ ...inputStyle, fontFamily: "monospace", flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Warna Background</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="color" value={form.bg_warna} onChange={(e) => setForm((p) => ({ ...p, bg_warna: e.target.value }))} style={{ width: 44, height: 36, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, cursor: "pointer", padding: 2 }} />
                <input value={form.bg_warna} onChange={(e) => setForm((p) => ({ ...p, bg_warna: e.target.value }))} placeholder="#FFFFFF" style={{ ...inputStyle, fontFamily: "monospace", flex: 1 }} />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

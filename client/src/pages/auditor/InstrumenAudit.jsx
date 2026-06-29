// Instrumen Audit - Auditor
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "../../components/Layout.jsx";
import DataTable from "../../components/DataTable.jsx";
import Modal from "../../components/Modal.jsx";
import FilterBar from "../../components/FilterBar.jsx";
import Pagination from "../../components/Pagination.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import SkorBadge from "../../components/SkorBadge.jsx";
import CONFIG from "../../config.js";
import api from "../../api.js";

const T = CONFIG.theme;

export default function InstrumenAudit() {
  const [data, setData]           = useState([]);
  const [standarList, setStandar] = useState([]);
  const [prodiList, setProdi]     = useState([]);
  const [skorConfig, setSkor]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [modal, setModal]         = useState(null); // { instrumen }
  const [form, setForm]           = useState({ skor: "", catatan: "", rekomendasi: "", tindak_lanjut: "" });
  const [saving, setSaving]       = useState(false);
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(CONFIG.defaultPageSize);
  const [filters, setFilters]     = useState({ standar_id: "", prodi_id: "", status: "" });

  const fetchRefs = useCallback(async () => {
    try {
      const [s, p, sk] = await Promise.all([api.get("/standar"), api.get("/prodi"), api.get("/skor-config")]);
      setStandar(s.data || []);
      setProdi(p.data || []);
      setSkor(sk.data || []);
    } catch {}
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = {};
      if (filters.standar_id) params.standar_id = filters.standar_id;
      if (filters.prodi_id)   params.prodi_id   = filters.prodi_id;
      if (filters.status)     params.status     = filters.status;
      const res = await api.get("/instrumen", { params });
      setData(res.data || []);
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data.");
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchRefs(); }, [fetchRefs]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const openAudit = useCallback((row) => {
    const existing = row.hasil_audit;
    setForm({
      skor:          existing?.skor != null ? String(existing.skor) : "",
      catatan:       existing?.catatan       || "",
      rekomendasi:   existing?.rekomendasi   || "",
      tindak_lanjut: existing?.tindak_lanjut || "",
    });
    setModal({ instrumen: row });
    setError("");
  }, []);

  const handleSubmit = useCallback(async () => {
    if (form.skor === "") { setError("Skor wajib dipilih."); return; }
    setSaving(true); setError("");
    try {
      await api.put(`/instrumen/${modal.instrumen.id}/audit`, {
        skor:          Number(form.skor),
        catatan:       form.catatan       || null,
        rekomendasi:   form.rekomendasi   || null,
        tindak_lanjut: form.tindak_lanjut || null,
      });
      setModal(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan hasil audit.");
    } finally { setSaving(false); }
  }, [form, modal, fetchData]);

  const paged = useMemo(() => data.slice((page - 1) * pageSize, page * pageSize), [data, page, pageSize]);

  const textareaStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 13, outline: "none", resize: "vertical", minHeight: 72, boxSizing: "border-box", fontFamily: T.fontFamily };

  const columns = [
    { key: "no",    label: "No",   width: 48, align: "center", render: (_, __, i) => (page - 1) * pageSize + i + 1 },
    { key: "standar_nama", label: "Standar",      render: (_, r) => <span style={{ fontSize: 13 }}>{r.standar?.nama || "-"}</span> },
    { key: "prodi_nama",   label: "Prodi",        render: (_, r) => <span style={{ fontWeight: 600, fontSize: 13, color: T.primary }}>{r.prodi?.kode || "-"}</span> },
    { key: "auditee_nama", label: "Auditee",      render: (_, r) => <span style={{ fontSize: 13 }}>{r.auditee?.nama || "-"}</span> },
    { key: "status",       label: "Status",       render: (_, r) => <StatusBadge status={r.status} /> },
    { key: "skor",         label: "Skor",         align: "center", render: (_, r) => <SkorBadge skor={r.hasil_audit?.skor} skorConfig={skorConfig} /> },
    { key: "aksi",         label: "Aksi",         align: "center", render: (_, r) => (
      <button
        onClick={() => openAudit(r)}
        disabled={r.status === "belum"}
        style={{
          padding: "4px 12px", border: "none", borderRadius: T.radiusSm,
          background: r.status === "belum" ? T.bgPage : T.primaryLight,
          color: r.status === "belum" ? T.textMuted : T.primary,
          fontSize: 12, fontWeight: 500,
          cursor: r.status === "belum" ? "not-allowed" : "pointer",
        }}
        title={r.status === "belum" ? "Tunggu auditee mengisi evaluasi diri" : ""}
      >
        {r.hasil_audit ? "✏️ Edit Audit" : CONFIG.labels.audit}
      </button>
    )},
  ];

  return (
    <Layout title="Instrumen Audit">
      {error && <div style={{ padding: "10px 14px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 12 }}>⚠️ {error}</div>}

      <FilterBar
        filters={[
          { key: "standar_id", type: "select", label: "Standar", options: standarList.map((s) => ({ value: s.id, label: s.nama })) },
          { key: "prodi_id",   type: "select", label: "Prodi",   options: prodiList.map((p) => ({ value: p.id, label: `${p.kode} - ${p.nama}` })) },
          { key: "status",     type: "select", label: "Status",  options: [
            { value: "belum",   label: "Belum Diisi" },
            { value: "diisi",   label: "Evaluasi Masuk" },
            { value: "proses",  label: "Proses Audit" },
            { value: "selesai", label: "Selesai" },
          ]},
        ]}
        values={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onReset={() => setFilters({ standar_id: "", prodi_id: "", status: "" })}
      />

      <DataTable columns={columns} data={paged} loading={loading} />
      <Pagination page={page} pageSize={pageSize} total={data.length} onPageChange={setPage} onPageSizeChange={setPageSize} />

      {/* Modal form audit */}
      <Modal
        open={!!modal}
        onClose={() => { setModal(null); setError(""); }}
        title={`Form Audit — ${modal?.instrumen?.standar?.nama || ""}`}
        wide
        footer={
          <>
            <button onClick={() => { setModal(null); setError(""); }} style={{ padding: "8px 18px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, background: T.bgCard, fontSize: 13, cursor: "pointer" }}>{CONFIG.labels.batal}</button>
            <button onClick={handleSubmit} disabled={saving} style={{ padding: "8px 18px", background: T.primary, color: "#fff", border: "none", borderRadius: T.radiusSm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "Menyimpan..." : "Simpan Hasil Audit"}
            </button>
          </>
        }
      >
        {error && <div style={{ padding: "8px 12px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 12, fontSize: 13 }}>⚠️ {error}</div>}

        {/* Info instrumen */}
        <div style={{ background: T.bgPage, borderRadius: T.radiusSm, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><span style={{ color: T.textMuted }}>Standar: </span><strong>{modal?.instrumen?.standar?.nama}</strong></div>
            <div><span style={{ color: T.textMuted }}>Prodi: </span><strong>{modal?.instrumen?.prodi?.kode} — {modal?.instrumen?.prodi?.nama}</strong></div>
            <div><span style={{ color: T.textMuted }}>Auditee: </span><strong>{modal?.instrumen?.auditee?.nama || "-"}</strong></div>
            <div><span style={{ color: T.textMuted }}>Status: </span><StatusBadge status={modal?.instrumen?.status} /></div>
          </div>
        </div>

        {/* Evaluasi diri (read-only) */}
        {modal?.instrumen?.evaluasi_diri && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              📄 Evaluasi Diri Auditee
            </div>
            <div style={{
              padding: "12px 14px", background: T.primaryLight,
              borderRadius: T.radiusSm, fontSize: 13, color: T.textPrimary,
              borderLeft: `3px solid ${T.primary}`, lineHeight: 1.6,
            }}>
              {modal.instrumen.evaluasi_diri.deskripsi || "(Tidak ada deskripsi)"}
            </div>
            {modal.instrumen.evaluasi_diri.file_path && (
              <a
                href={modal.instrumen.evaluasi_diri.file_path}
                target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 12, color: T.primary }}
              >
                📎 Lihat Dokumen PDF
              </a>
            )}
          </div>
        )}

        {/* Pilih skor */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Skor Audit *
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {skorConfig.map((s) => {
              const selected = String(form.skor) === String(s.nilai);
              return (
                <button
                  key={s.nilai}
                  onClick={() => setForm((p) => ({ ...p, skor: String(s.nilai) }))}
                  style={{
                    padding: "8px 16px", border: `2px solid ${selected ? s.warna : T.border}`,
                    borderRadius: T.radiusSm, cursor: "pointer",
                    background: selected ? s.bg_warna : T.bgCard,
                    color: selected ? s.warna : T.textSecondary,
                    fontSize: 13, fontWeight: selected ? 700 : 400,
                    transition: "all 0.15s",
                  }}
                >
                  {s.nilai} — {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Catatan, rekomendasi, tindak lanjut */}
        {[
          { key: "catatan",       label: CONFIG.labels.catatan,       placeholder: "Tuliskan catatan hasil audit..." },
          { key: "rekomendasi",   label: CONFIG.labels.rekomendasi,   placeholder: "Tuliskan rekomendasi perbaikan..." },
          { key: "tindak_lanjut", label: CONFIG.labels.tindakLanjut,  placeholder: "Tuliskan rencana tindak lanjut..." },
        ].map(({ key, label, placeholder }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>{label}</label>
            <textarea
              value={form[key]}
              onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
              placeholder={placeholder}
              style={textareaStyle}
            />
          </div>
        ))}
      </Modal>
    </Layout>
  );
}

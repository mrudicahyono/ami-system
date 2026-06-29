// Verifikasi RTL - Auditor/Admin
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "../../components/Layout.jsx";
import DataTable from "../../components/DataTable.jsx";
import Modal from "../../components/Modal.jsx";
import FilterBar from "../../components/FilterBar.jsx";
import Pagination from "../../components/Pagination.jsx";
import CONFIG from "../../config.js";
import api from "../../api.js";

const T = CONFIG.theme;

const RTL_STATUS = {
  belum:        { label: "Belum Diisi",  color: T.textMuted, bg: T.bgPage },
  dilaksanakan: { label: "Dilaksanakan", color: T.warning,   bg: T.warningLight },
  diverifikasi: { label: "Diverifikasi", color: T.success,   bg: T.successLight },
};

export default function VerifikasiRTL() {
  const [data, setData]           = useState([]);
  const [standarList, setStandar] = useState([]);
  const [prodiList, setProdi]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState({ catatan_verifikasi: "" });
  const [saving, setSaving]       = useState(false);
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(CONFIG.defaultPageSize);
  const [filters, setFilters]     = useState({ standar_id: "", prodi_id: "" });

  const fetchRefs = useCallback(async () => {
    try {
      const [s, p] = await Promise.all([api.get("/standar"), api.get("/prodi")]);
      setStandar(s.data || []);
      setProdi(p.data || []);
    } catch {}
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = { perlu_rtl: 1 };
      if (filters.standar_id) params.standar_id = filters.standar_id;
      if (filters.prodi_id)   params.prodi_id   = filters.prodi_id;
      const res = await api.get("/instrumen", { params });
      setData((res.data || []).filter((r) => r.perlu_rtl === 1));
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data.");
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchRefs(); }, [fetchRefs]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const openModal = useCallback(async (row) => {
    setError("");
    try {
      const res = await api.get(`/instrumen/${row.id}/rtl`);
      const rtl = res.data?.[0] || null;
      setForm({ catatan_verifikasi: rtl?.catatan_verifikasi || "" });
      setModal({ instrumen: row, rtl });
    } catch {
      setModal({ instrumen: row, rtl: null });
    }
  }, []);

  const handleVerifikasi = useCallback(async () => {
    setSaving(true); setError("");
    try {
      await api.put(`/instrumen/${modal.instrumen.id}/rtl/verifikasi`, {
        catatan_verifikasi: form.catatan_verifikasi || null,
      });
      setModal(null); fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memverifikasi.");
    } finally { setSaving(false); }
  }, [form, modal, fetchData]);

  const paged = useMemo(() => data.slice((page - 1) * pageSize, page * pageSize), [data, page, pageSize]);

  const columns = [
    { key: "no", label: "No", width: 48, align: "center", render: (_, __, i) => (page - 1) * pageSize + i + 1 },
    { key: "standar_nama",   label: "Standar",   render: (_, r) => <span style={{ fontSize: 12, color: T.textSecondary }}>{r.standar_nama || "-"}</span> },
    { key: "indikator_kode", label: "Indikator", render: (_, r) => (
      <div>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.primary }}>{r.indikator_kode}</span>
        <div style={{ fontSize: 12, color: T.textPrimary, marginTop: 2 }}>{r.indikator_deskripsi}</div>
      </div>
    )},
    { key: "prodi_kode",  label: "Prodi",   render: (_, r) => <span style={{ fontWeight: 600, fontSize: 12, color: T.primary }}>{r.prodi_kode}</span> },
    { key: "auditee_nama",label: "Auditee", render: (_, r) => <span style={{ fontSize: 12 }}>{r.auditee_nama || "-"}</span> },
    { key: "rtl_status",  label: "Status RTL", render: (_, r) => {
      const st = r.rtl_status || "belum";
      const cfg = RTL_STATUS[st] || RTL_STATUS.belum;
      return <span style={{ padding: "3px 10px", borderRadius: T.radiusPill, fontSize: 12, fontWeight: 600, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
    }},
    { key: "aksi", label: "Aksi", align: "center", render: (_, r) => (
      <button
        onClick={() => openModal(r)}
        style={{ padding: "4px 12px", border: "none", borderRadius: T.radiusSm, background: r.rtl_status === "diverifikasi" ? T.successLight : T.primaryLight, color: r.rtl_status === "diverifikasi" ? T.success : T.primary, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
      >
        {r.rtl_status === "diverifikasi" ? "✅ Sudah" : r.rtl_status === "dilaksanakan" ? "🔍 Verifikasi" : "📋 Lihat"}
      </button>
    )},
  ];

  const isAlreadyVerified = modal?.rtl?.status === "diverifikasi";

  return (
    <Layout title="Verifikasi Tindak Lanjut">
      {error && <div style={{ padding: "10px 14px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 12 }}>⚠️ {error}</div>}

      <FilterBar
        filters={[
          { key: "standar_id", type: "select", label: "Standar", options: standarList.map((s) => ({ value: s.id, label: s.nama })) },
          { key: "prodi_id",   type: "select", label: "Prodi",   options: prodiList.map((p) => ({ value: p.id, label: `${p.kode} - ${p.nama}` })) },
        ]}
        values={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onReset={() => setFilters({ standar_id: "", prodi_id: "" })}
      />

      <DataTable columns={columns} data={paged} loading={loading} />
      <Pagination page={page} pageSize={pageSize} total={data.length} onPageChange={setPage} onPageSizeChange={setPageSize} />

      <Modal
        open={!!modal}
        onClose={() => { setModal(null); setError(""); }}
        title="Verifikasi Tindak Lanjut"
        wide
        footer={
          <>
            <button onClick={() => { setModal(null); setError(""); }} style={{ padding: "8px 18px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, background: T.bgCard, fontSize: 13, cursor: "pointer" }}>
              {isAlreadyVerified ? "Tutup" : CONFIG.labels.batal}
            </button>
            {!isAlreadyVerified && modal?.rtl?.status === "dilaksanakan" && (
              <button onClick={handleVerifikasi} disabled={saving} style={{ padding: "8px 18px", background: T.success, color: "#fff", border: "none", borderRadius: T.radiusSm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {saving ? "Memverifikasi..." : "✅ Verifikasi & Setujui"}
              </button>
            )}
          </>
        }
      >
        {error && <div style={{ padding: "8px 12px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 12, fontSize: 13 }}>⚠️ {error}</div>}

        {/* Info instrumen */}
        <div style={{ background: T.bgPage, borderRadius: T.radiusSm, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><span style={{ color: T.textMuted }}>Standar: </span><strong>{modal?.instrumen?.standar_nama}</strong></div>
            <div><span style={{ color: T.textMuted }}>Prodi: </span><strong>{modal?.instrumen?.prodi_kode} — {modal?.instrumen?.prodi_nama}</strong></div>
            <div style={{ gridColumn: "1/-1" }}>
              <span style={{ color: T.textMuted }}>Indikator: </span>
              <strong style={{ color: T.primary }}>{modal?.instrumen?.indikator_kode}</strong>
              <span style={{ marginLeft: 8 }}>{modal?.instrumen?.indikator_deskripsi}</span>
            </div>
            <div><span style={{ color: T.textMuted }}>Auditee: </span><strong>{modal?.instrumen?.auditee_nama || "-"}</strong></div>
          </div>
        </div>

        {/* Bukti RTL dari auditee */}
        {modal?.rtl ? (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>📄 Bukti Tindak Lanjut Auditee</div>
            <div style={{ padding: "12px 14px", background: T.primaryLight, borderRadius: T.radiusSm, fontSize: 13, borderLeft: `3px solid ${T.primary}`, lineHeight: 1.6, marginBottom: 12 }}>
              {modal.rtl.deskripsi}
            </div>
            {modal.rtl.file_path && (
              <a href={modal.rtl.file_path} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16, fontSize: 12, color: T.primary }}>
                📎 Lihat Dokumen Bukti PDF
              </a>
            )}

            {/* Catatan verifikasi */}
            <div style={{ marginTop: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Catatan Verifikasi (opsional)
              </label>
              {isAlreadyVerified ? (
                <div style={{ padding: "12px 14px", background: T.successLight, borderRadius: T.radiusSm, fontSize: 13, color: T.success }}>
                  {modal.rtl.catatan_verifikasi || "(Tidak ada catatan)"}
                </div>
              ) : (
                <textarea
                  value={form.catatan_verifikasi}
                  onChange={(e) => setForm((p) => ({ ...p, catatan_verifikasi: e.target.value }))}
                  placeholder="Tuliskan catatan verifikasi jika diperlukan..."
                  style={{ width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 13, outline: "none", resize: "vertical", minHeight: 80, boxSizing: "border-box" }}
                />
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 30, color: T.textMuted }}>
            Auditee belum mengisi tindak lanjut untuk indikator ini.
          </div>
        )}
      </Modal>
    </Layout>
  );
}
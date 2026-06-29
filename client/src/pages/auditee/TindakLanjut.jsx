// Tindak Lanjut - Auditee
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Layout from "../../components/Layout.jsx";
import DataTable from "../../components/DataTable.jsx";
import Modal from "../../components/Modal.jsx";
import FilterBar from "../../components/FilterBar.jsx";
import Pagination from "../../components/Pagination.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import CONFIG from "../../config.js";
import api from "../../api.js";

const T = CONFIG.theme;

const RTL_STATUS = {
  belum:        { label: "Belum Diisi",    color: T.textMuted,  bg: T.bgPage },
  dilaksanakan: { label: "Dilaksanakan",   color: T.warning,    bg: T.warningLight },
  diverifikasi: { label: "Diverifikasi",   color: T.success,    bg: T.successLight },
};

export default function TindakLanjut() {
  const [data, setData]           = useState([]);
  const [standarList, setStandar] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState({ deskripsi: "", file_path: "" });
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(CONFIG.defaultPageSize);
  const [filters, setFilters]     = useState({ standar_id: "" });
  const fileRef = useRef(null);

  const fetchRefs = useCallback(async () => {
    try {
      const res = await api.get("/standar");
      setStandar(res.data || []);
    } catch {}
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = { perlu_rtl: 1 };
      if (filters.standar_id) params.standar_id = filters.standar_id;
      const res = await api.get("/instrumen", { params });
      // Hanya tampilkan instrumen yang perlu RTL
      setData((res.data || []).filter((r) => r.perlu_rtl === 1));
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data.");
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchRefs(); }, [fetchRefs]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchRTL = useCallback(async (instrumen_id) => {
    try {
      const res = await api.get(`/instrumen/${instrumen_id}/rtl`);
      return res.data?.[0] || null;
    } catch { return null; }
  }, []);

  const openModal = useCallback(async (row) => {
    setError("");
    const rtl = await fetchRTL(row.id);
    setForm({
      deskripsi: rtl?.deskripsi || "",
      file_path: rtl?.file_path || "",
    });
    setModal({ instrumen: row, rtl });
  }, [fetchRTL]);

  const handleUpload = useCallback(async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Hanya file PDF yang diizinkan."); return; }
    if (file.size > 10 * 1024 * 1024)   { setError("Ukuran file maksimal 10MB."); return; }
    setUploading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm((p) => ({ ...p, file_path: res.data.filePath || res.data.data?.filePath }));
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengupload file.");
    } finally { setUploading(false); }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.deskripsi.trim()) { setError("Deskripsi tindak lanjut wajib diisi."); return; }
    setSaving(true); setError("");
    try {
      await api.post(`/instrumen/${modal.instrumen.id}/rtl`, {
        deskripsi: form.deskripsi.trim(),
        file_path: form.file_path || null,
      });
      setModal(null); fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan.");
    } finally { setSaving(false); }
  }, [form, modal, fetchData]);

  const paged = useMemo(() => data.slice((page - 1) * pageSize, page * pageSize), [data, page, pageSize]);
  const textareaStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 13, outline: "none", resize: "vertical", minHeight: 100, boxSizing: "border-box" };

  const getRtlStatus = (row) => {
    if (!row.perlu_rtl) return null;
    // status akan datang dari join nanti — untuk sekarang cek dari data rtl
    return row.rtl_status || "belum";
  };

  const columns = [
    { key: "no", label: "No", width: 48, align: "center", render: (_, __, i) => (page - 1) * pageSize + i + 1 },
    { key: "standar_nama",   label: "Standar",   render: (_, r) => <span style={{ fontSize: 12, color: T.textSecondary }}>{r.standar_nama || "-"}</span> },
    { key: "indikator_kode", label: "Indikator", render: (_, r) => (
      <div>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.primary }}>{r.indikator_kode}</span>
        <div style={{ fontSize: 12, color: T.textPrimary, marginTop: 2 }}>{r.indikator_deskripsi}</div>
      </div>
    )},
    { key: "prodi_kode", label: "Prodi", render: (_, r) => <span style={{ fontWeight: 600, fontSize: 12, color: T.primary }}>{r.prodi_kode}</span> },
    { key: "rekomendasi", label: "Rekomendasi Auditor", render: (_, r) => (
      <span style={{ fontSize: 12, color: T.textSecondary, fontStyle: r.rekomendasi ? "normal" : "italic" }}>
        {r.rekomendasi || "Tidak ada rekomendasi"}
      </span>
    )},
    { key: "rtl_status", label: "Status RTL", render: (_, r) => {
      const st = getRtlStatus(r);
      const cfg = RTL_STATUS[st] || RTL_STATUS.belum;
      return <span style={{ padding: "3px 10px", borderRadius: T.radiusPill, fontSize: 12, fontWeight: 600, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
    }},
    { key: "aksi", label: "Aksi", align: "center", render: (_, r) => (
      <button
        onClick={() => openModal(r)}
        style={{ padding: "4px 12px", border: "none", borderRadius: T.radiusSm, background: T.primaryLight, color: T.primary, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
      >
        {r.rtl_status === "diverifikasi" ? "📋 Lihat" : "✏️ Isi RTL"}
      </button>
    )},
  ];

  const isVerified = modal?.rtl?.status === "diverifikasi";

  return (
    <Layout title="Tindak Lanjut (RTL)">
      {error && <div style={{ padding: "10px 14px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 12 }}>⚠️ {error}</div>}

      {data.length === 0 && !loading && (
        <div style={{ padding: "40px 20px", textAlign: "center", color: T.textMuted, background: T.bgCard, borderRadius: T.radius, boxShadow: T.shadow }}>
          ✅ Tidak ada indikator yang memerlukan tindak lanjut saat ini.
        </div>
      )}

      {data.length > 0 && (
        <>
          <FilterBar
            filters={[{ key: "standar_id", type: "select", label: "Standar", options: standarList.map((s) => ({ value: s.id, label: s.nama })) }]}
            values={filters}
            onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
            onReset={() => setFilters({ standar_id: "" })}
          />
          <DataTable columns={columns} data={paged} loading={loading} />
          <Pagination page={page} pageSize={pageSize} total={data.length} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </>
      )}

      <Modal
        open={!!modal}
        onClose={() => { setModal(null); setError(""); }}
        title="Isi Tindak Lanjut (RTL)"
        wide
        footer={isVerified ? (
          <button onClick={() => setModal(null)} style={{ padding: "8px 18px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, background: T.bgCard, fontSize: 13, cursor: "pointer" }}>Tutup</button>
        ) : (
          <>
            <button onClick={() => { setModal(null); setError(""); }} style={{ padding: "8px 18px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, background: T.bgCard, fontSize: 13, cursor: "pointer" }}>{CONFIG.labels.batal}</button>
            <button onClick={handleSubmit} disabled={saving} style={{ padding: "8px 18px", background: T.primary, color: "#fff", border: "none", borderRadius: T.radiusSm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "Menyimpan..." : "Simpan Tindak Lanjut"}
            </button>
          </>
        )}
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
          </div>
        </div>

        {/* Rekomendasi auditor */}
        {modal?.instrumen?.rekomendasi && (
          <div style={{ marginBottom: 16, padding: "12px 14px", background: T.warningLight, borderRadius: T.radiusSm, borderLeft: `3px solid ${T.warning}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.warning, marginBottom: 6 }}>⚠️ Rekomendasi Auditor</div>
            <div style={{ fontSize: 13, color: T.textPrimary, lineHeight: 1.6 }}>{modal.instrumen.rekomendasi}</div>
          </div>
        )}

        {/* Catatan verifikasi jika sudah diverifikasi */}
        {isVerified && modal?.rtl?.catatan_verifikasi && (
          <div style={{ marginBottom: 16, padding: "12px 14px", background: T.successLight, borderRadius: T.radiusSm, borderLeft: `3px solid ${T.success}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.success, marginBottom: 6 }}>✅ Catatan Verifikasi</div>
            <div style={{ fontSize: 13, color: T.textPrimary }}>{modal.rtl.catatan_verifikasi}</div>
          </div>
        )}

        {/* Form RTL */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Deskripsi Tindak Lanjut yang Telah Dilakukan *
          </label>
          {isVerified ? (
            <div style={{ padding: "12px 14px", background: T.bgPage, borderRadius: T.radiusSm, fontSize: 13, lineHeight: 1.7 }}>{form.deskripsi}</div>
          ) : (
            <textarea value={form.deskripsi} onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))} placeholder="Jelaskan tindakan perbaikan yang telah dilakukan..." style={{ ...textareaStyle, minHeight: 120 }} />
          )}
        </div>

        {/* Upload bukti PDF */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Upload Bukti Tindak Lanjut (PDF)
          </label>
          {form.file_path ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: T.successLight, borderRadius: T.radiusSm }}>
              <span>📎</span>
              <a href={form.file_path} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: T.success, fontWeight: 500 }}>Lihat Dokumen Bukti</a>
              {!isVerified && (
                <button onClick={() => setForm((p) => ({ ...p, file_path: "" }))} style={{ marginLeft: "auto", border: "none", background: "none", color: T.danger, cursor: "pointer", fontSize: 12 }}>✕ Hapus</button>
              )}
            </div>
          ) : !isVerified ? (
            <div>
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => handleUpload(e.target.files[0])} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: "9px 16px", border: `1.5px dashed ${T.border}`, borderRadius: T.radiusSm, background: T.bgPage, color: T.textSecondary, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <span>{uploading ? "⏳" : "📤"}</span>
                {uploading ? "Mengupload..." : "Pilih File PDF Bukti (max 10MB)"}
              </button>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: T.textMuted }}>Tidak ada dokumen diunggah.</div>
          )}
        </div>
      </Modal>
    </Layout>
  );
}
// Evaluasi Diri - Auditee
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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

export default function EvaluasiDiri() {
  const [data, setData]           = useState([]);
  const [standarList, setStandar] = useState([]);
  const [skorConfig, setSkor]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [modal, setModal]         = useState(null); // { instrumen, mode: 'edit' | 'view' }
  const [form, setForm]           = useState({ deskripsi: "", file_path: "" });
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(CONFIG.defaultPageSize);
  const [filters, setFilters]     = useState({ standar_id: "", status: "" });
  const fileRef = useRef(null);

  const fetchRefs = useCallback(async () => {
    try {
      const [s, sk] = await Promise.all([api.get("/standar"), api.get("/skor-config")]);
      setStandar(s.data.data.standar || []);
      setSkor(sk.data.data.skorConfig || []);
    } catch {}
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = {};
      if (filters.standar_id) params.standar_id = filters.standar_id;
      if (filters.status)     params.status     = filters.status;
      const res = await api.get("/instrumen", { params });
      setData(res.data.data.instrumen || []);
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data.");
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchRefs(); }, [fetchRefs]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const openEvaluasi = useCallback((row) => {
    const existing = row.evaluasi_diri;
    setForm({
      deskripsi: existing?.deskripsi || "",
      file_path: existing?.file_path || "",
    });
    setModal({ instrumen: row, mode: row.status === "selesai" ? "view" : "edit" });
    setError("");
  }, []);

  const handleUpload = useCallback(async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Hanya file PDF yang diizinkan."); return; }
    if (file.size > 10 * 1024 * 1024)   { setError("Ukuran file maksimal 10MB."); return; }

    setUploading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((p) => ({ ...p, file_path: res.data.data.filePath }));
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengupload file.");
    } finally { setUploading(false); }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.deskripsi.trim()) { setError("Deskripsi evaluasi wajib diisi."); return; }
    setSaving(true); setError("");
    try {
      await api.put(`/instrumen/${modal.instrumen.id}/evaluasi`, {
        deskripsi: form.deskripsi.trim(),
        file_path: form.file_path || null,
      });
      setModal(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan evaluasi.");
    } finally { setSaving(false); }
  }, [form, modal, fetchData]);

  const paged = useMemo(() => data.slice((page - 1) * pageSize, page * pageSize), [data, page, pageSize]);

  const isViewMode = modal?.mode === "view";
  const textareaStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 13, outline: "none", resize: "vertical", minHeight: 100, boxSizing: "border-box", fontFamily: T.fontFamily };

  const columns = [
    { key: "no",    label: "No", width: 48, align: "center", render: (_, __, i) => (page - 1) * pageSize + i + 1 },
    { key: "standar_nama", label: "Standar",  render: (_, r) => <span style={{ fontSize: 13 }}>{r.standar?.nama || "-"}</span> },
    { key: "prodi_nama",   label: "Prodi",    render: (_, r) => <span style={{ fontWeight: 600, fontSize: 13, color: T.primary }}>{r.prodi?.kode || "-"}</span> },
    { key: "status",       label: "Status",   render: (_, r) => <StatusBadge status={r.status} /> },
    { key: "skor",         label: "Skor Audit", align: "center", render: (_, r) => <SkorBadge skor={r.hasil_audit?.skor} skorConfig={skorConfig} /> },
    { key: "aksi",         label: "Aksi",     align: "center", render: (_, r) => (
      <button
        onClick={() => openEvaluasi(r)}
        style={{
          padding: "4px 12px", border: "none", borderRadius: T.radiusSm,
          background: r.status === "selesai" ? T.bgPage : T.primaryLight,
          color: r.status === "selesai" ? T.textSecondary : T.primary,
          fontSize: 12, fontWeight: 500, cursor: "pointer",
        }}
      >
        {r.status === "selesai" ? "📋 Lihat Detail" : (r.evaluasi_diri ? "✏️ Edit" : CONFIG.labels.evaluasi)}
      </button>
    )},
  ];

  return (
    <Layout title="Evaluasi Diri">
      {error && <div style={{ padding: "10px 14px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 12 }}>⚠️ {error}</div>}

      <FilterBar
        filters={[
          { key: "standar_id", type: "select", label: "Standar", options: standarList.map((s) => ({ value: s.id, label: s.nama })) },
          { key: "status",     type: "select", label: "Status",  options: [
            { value: "belum",   label: "Belum Diisi" },
            { value: "diisi",   label: "Sudah Diisi" },
            { value: "proses",  label: "Proses Audit" },
            { value: "selesai", label: "Selesai" },
          ]},
        ]}
        values={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onReset={() => setFilters({ standar_id: "", status: "" })}
      />

      <DataTable columns={columns} data={paged} loading={loading} />
      <Pagination page={page} pageSize={pageSize} total={data.length} onPageChange={setPage} onPageSizeChange={setPageSize} />

      {/* Modal evaluasi */}
      <Modal
        open={!!modal}
        onClose={() => { setModal(null); setError(""); }}
        title={isViewMode ? `Detail Audit — ${modal?.instrumen?.standar?.nama}` : `Isi Evaluasi Diri — ${modal?.instrumen?.standar?.nama}`}
        wide
        footer={isViewMode ? (
          <button onClick={() => { setModal(null); }} style={{ padding: "8px 18px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, background: T.bgCard, fontSize: 13, cursor: "pointer" }}>
            Tutup
          </button>
        ) : (
          <>
            <button onClick={() => { setModal(null); setError(""); }} style={{ padding: "8px 18px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, background: T.bgCard, fontSize: 13, cursor: "pointer" }}>{CONFIG.labels.batal}</button>
            <button onClick={handleSubmit} disabled={saving} style={{ padding: "8px 18px", background: T.primary, color: "#fff", border: "none", borderRadius: T.radiusSm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "Menyimpan..." : "Simpan Evaluasi"}
            </button>
          </>
        )}
      >
        {error && <div style={{ padding: "8px 12px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 12, fontSize: 13 }}>⚠️ {error}</div>}

        {/* Info instrumen */}
        <div style={{ background: T.bgPage, borderRadius: T.radiusSm, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><span style={{ color: T.textMuted }}>Standar: </span><strong>{modal?.instrumen?.standar?.nama}</strong></div>
            <div><span style={{ color: T.textMuted }}>Prodi: </span><strong>{modal?.instrumen?.prodi?.kode} — {modal?.instrumen?.prodi?.nama}</strong></div>
            <div><span style={{ color: T.textMuted }}>Periode: </span><strong>{modal?.instrumen?.periode?.nama}</strong></div>
            <div><span style={{ color: T.textMuted }}>Status: </span><StatusBadge status={modal?.instrumen?.status} /></div>
          </div>
        </div>

        {/* Form evaluasi diri */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Deskripsi Evaluasi Diri {!isViewMode && "*"}
          </label>
          {isViewMode ? (
            <div style={{ padding: "12px 14px", background: T.bgPage, borderRadius: T.radiusSm, fontSize: 13, color: T.textPrimary, lineHeight: 1.7 }}>
              {modal?.instrumen?.evaluasi_diri?.deskripsi || "(Tidak ada deskripsi)"}
            </div>
          ) : (
            <textarea
              value={form.deskripsi}
              onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
              placeholder="Deskripsikan kondisi dan pencapaian standar ini..."
              style={{ ...textareaStyle, minHeight: 120 }}
            />
          )}
        </div>

        {/* Upload PDF */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {CONFIG.labels.uploadPdf}
          </label>
          {form.file_path ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: T.successLight, borderRadius: T.radiusSm }}>
              <span style={{ fontSize: 18 }}>📎</span>
              <a href={form.file_path} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: T.success, fontWeight: 500 }}>
                Lihat Dokumen PDF
              </a>
              {!isViewMode && (
                <button
                  onClick={() => setForm((p) => ({ ...p, file_path: "" }))}
                  style={{ marginLeft: "auto", border: "none", background: "none", color: T.danger, cursor: "pointer", fontSize: 12 }}
                >
                  ✕ Hapus
                </button>
              )}
            </div>
          ) : !isViewMode ? (
            <div>
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => handleUpload(e.target.files[0])} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                style={{
                  padding: "9px 16px", border: `1.5px dashed ${T.border}`,
                  borderRadius: T.radiusSm, background: T.bgPage,
                  color: T.textSecondary, fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                <span>{uploading ? "⏳" : "📤"}</span>
                {uploading ? "Mengupload..." : "Pilih File PDF (max 10MB)"}
              </button>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: T.textMuted }}>Tidak ada dokumen diunggah.</div>
          )}
        </div>

        {/* Hasil audit (read-only, jika ada) */}
        {modal?.instrumen?.hasil_audit && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
              📊 Hasil Audit
              <SkorBadge skor={modal.instrumen.hasil_audit.skor} skorConfig={skorConfig} />
            </div>
            {[
              { label: "Catatan Auditor",  val: modal.instrumen.hasil_audit.catatan },
              { label: "Rekomendasi",      val: modal.instrumen.hasil_audit.rekomendasi },
              { label: "Tindak Lanjut",    val: modal.instrumen.hasil_audit.tindak_lanjut },
            ].map(({ label, val }) => val ? (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 4 }}>{label}</div>
                <div style={{ padding: "10px 14px", background: T.bgPage, borderRadius: T.radiusSm, fontSize: 13, color: T.textPrimary, lineHeight: 1.6 }}>
                  {val}
                </div>
              </div>
            ) : null)}
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 8 }}>
              Diaudit oleh: <strong>{modal.instrumen.hasil_audit.auditor_nama || "-"}</strong>
              {modal.instrumen.hasil_audit.updated_at && ` · ${new Date(modal.instrumen.hasil_audit.updated_at).toLocaleDateString("id-ID")}`}
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}

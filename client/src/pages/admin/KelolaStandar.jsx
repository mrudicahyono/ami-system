// Kelola Standar SN-Dikti - Admin
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "../../components/Layout.jsx";
import DataTable from "../../components/DataTable.jsx";
import Modal from "../../components/Modal.jsx";
import Pagination from "../../components/Pagination.jsx";
import CONFIG from "../../config.js";
import api from "../../api.js";

const T = CONFIG.theme;

export default function KelolaStandar() {
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [modal, setModal]           = useState(null);
  const [form, setForm]             = useState({ nama: "", urutan: "" });
  const [saving, setSaving]         = useState(false);
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(CONFIG.defaultPageSize);

  // State untuk modal indikator
  const [indModal, setIndModal]     = useState(null); // { standar } | null
  const [indList, setIndList]       = useState([]);
  const [indLoading, setIndLoading] = useState(false);
  const [indForm, setIndForm]       = useState({ kode: "", deskripsi: "", urutan: "" });
  const [indEdit, setIndEdit]       = useState(null); // row yang diedit
  const [indSaving, setIndSaving]   = useState(false);
  const [indError, setIndError]     = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/standar");
      setData(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Standar CRUD ──────────────────────────────────────────────
  const openAdd  = () => { setError(""); setForm({ nama: "", urutan: data.length + 1 }); setModal({ mode: "add" }); };
  const openEdit = (row) => { setError(""); setForm({ nama: row.nama, urutan: row.urutan }); setModal({ mode: "edit", data: row }); };

  const handleSave = useCallback(async () => {
    if (!form.nama.trim()) { setError("Nama standar wajib diisi."); return; }
    setSaving(true); setError("");
    try {
      if (modal.mode === "add") {
        await api.post("/standar", { nama: form.nama.trim(), urutan: Number(form.urutan) || 0 });
      } else {
        await api.put(`/standar/${modal.data.id}`, { nama: form.nama.trim(), urutan: Number(form.urutan) || 0 });
      }
      setModal(null); fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan.");
    } finally { setSaving(false); }
  }, [form, modal, fetchData]);

  const handleDelete = useCallback(async (row) => {
    if (!window.confirm(CONFIG.labels.confirmHapus)) return;
    try { await api.delete(`/standar/${row.id}`); fetchData(); }
    catch (err) { setError(err.response?.data?.message || "Gagal menghapus."); }
  }, [fetchData]);

  // ── Indikator CRUD ────────────────────────────────────────────
  const fetchIndikator = useCallback(async (standar_id) => {
    setIndLoading(true); setIndError("");
    try {
      const res = await api.get("/indikator", { params: { standar_id } });
      setIndList(res.data || []);
    } catch { setIndError("Gagal memuat indikator."); }
    finally { setIndLoading(false); }
  }, []);

  const openIndModal = (standar) => {
    setIndModal({ standar });
    setIndEdit(null);
    setIndForm({ kode: "", deskripsi: "", urutan: "" });
    setIndError("");
    fetchIndikator(standar.id);
  };

  const openIndEdit = (row) => {
    setIndEdit(row);
    setIndForm({ kode: row.kode, deskripsi: row.deskripsi, urutan: row.urutan });
    setIndError("");
  };

  const handleIndSave = useCallback(async () => {
    if (!indForm.kode.trim() || !indForm.deskripsi.trim()) {
      setIndError("Kode dan deskripsi wajib diisi."); return;
    }
    setIndSaving(true); setIndError("");
    try {
      if (indEdit) {
        await api.put(`/indikator/${indEdit.id}`, {
          kode: indForm.kode.trim(),
          deskripsi: indForm.deskripsi.trim(),
          urutan: Number(indForm.urutan) || indEdit.urutan,
        });
      } else {
        await api.post("/indikator", {
          standar_id: indModal.standar.id,
          kode: indForm.kode.trim(),
          deskripsi: indForm.deskripsi.trim(),
        });
      }
      setIndEdit(null);
      setIndForm({ kode: "", deskripsi: "", urutan: "" });
      fetchIndikator(indModal.standar.id);
    } catch (err) {
      setIndError(err.response?.data?.message || "Gagal menyimpan.");
    } finally { setIndSaving(false); }
  }, [indForm, indEdit, indModal, fetchIndikator]);

  const handleIndDelete = useCallback(async (row) => {
    if (!window.confirm(`Hapus indikator ${row.kode}?`)) return;
    try {
      await api.delete(`/indikator/${row.id}`);
      fetchIndikator(indModal.standar.id);
    } catch (err) {
      setIndError(err.response?.data?.message || "Gagal menghapus.");
    }
  }, [indModal, fetchIndikator]);

  const paged = useMemo(() => data.slice((page - 1) * pageSize, page * pageSize), [data, page, pageSize]);

  const inputStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 13, color: T.textPrimary, outline: "none", boxSizing: "border-box" };
  const btnStyle = (c, bg) => ({ padding: "4px 10px", border: "none", borderRadius: T.radiusSm, background: bg, color: c, fontSize: 12, fontWeight: 500, cursor: "pointer", marginRight: 4 });

  const columns = [
    { key: "urutan", label: "No", width: 56, align: "center" },
    { key: "nama", label: "Nama Standar" },
    { key: "created_at", label: "Dibuat", render: (v) => v ? new Date(v).toLocaleDateString("id-ID") : "-" },
    { key: "aksi", label: "Aksi", align: "center", render: (_, r) => (
      <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
        <button onClick={() => openIndModal(r)} style={btnStyle(T.success, T.successLight)}>📋 Indikator</button>
        <button onClick={() => openEdit(r)} style={btnStyle(T.primary, T.primaryLight)}>{CONFIG.labels.edit}</button>
        <button onClick={() => handleDelete(r)} style={btnStyle(T.danger, T.dangerLight)}>{CONFIG.labels.hapus}</button>
      </div>
    )},
  ];

  return (
    <Layout title="Kelola Standar">
      {error && <div style={{ padding: "10px 14px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 12 }}>⚠️ {error}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={openAdd} style={{ padding: "8px 16px", background: T.primary, color: "#fff", border: "none", borderRadius: T.radiusSm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          ＋ {CONFIG.labels.tambah}
        </button>
      </div>

      <DataTable columns={columns} data={paged} loading={loading} />
      <Pagination page={page} pageSize={pageSize} total={data.length} onPageChange={setPage} onPageSizeChange={setPageSize} />

      {/* Modal Standar */}
      <Modal
        open={!!modal}
        onClose={() => { setModal(null); setError(""); }}
        title={modal?.mode === "add" ? "Tambah Standar" : "Edit Standar"}
        footer={
          <>
            <button onClick={() => { setModal(null); setError(""); }} style={{ padding: "8px 18px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, background: T.bgCard, color: T.textPrimary, fontSize: 13, cursor: "pointer" }}>{CONFIG.labels.batal}</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: "8px 18px", background: T.primary, color: "#fff", border: "none", borderRadius: T.radiusSm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "Menyimpan..." : CONFIG.labels.simpan}
            </button>
          </>
        }
      >
        {error && <div style={{ padding: "8px 12px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 12, fontSize: 13 }}>⚠️ {error}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Nama Standar *</label>
            <input value={form.nama} onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))} placeholder="Contoh: Standar Kompetensi Lulusan" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Urutan</label>
            <input type="number" min="1" value={form.urutan} onChange={(e) => setForm((p) => ({ ...p, urutan: e.target.value }))} placeholder="1" style={{ ...inputStyle, width: 100 }} />
          </div>
        </div>
      </Modal>

      {/* Modal Kelola Indikator */}
      <Modal
        open={!!indModal}
        onClose={() => { setIndModal(null); setIndEdit(null); setIndError(""); }}
        title={`Indikator — ${indModal?.standar?.nama || ""}`}
        wide
        footer={
          <button onClick={() => { setIndModal(null); setIndEdit(null); setIndError(""); }} style={{ padding: "8px 18px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, background: T.bgCard, fontSize: 13, cursor: "pointer" }}>
            Tutup
          </button>
        }
      >
        {indError && <div style={{ padding: "8px 12px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 12, fontSize: 13 }}>⚠️ {indError}</div>}

        {/* Form tambah/edit indikator */}
        <div style={{ background: T.bgPage, borderRadius: T.radiusSm, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, marginBottom: 10 }}>
            {indEdit ? `✏️ Edit Indikator: ${indEdit.kode}` : "➕ Tambah Indikator Baru"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 10, alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSecondary, marginBottom: 4 }}>Kode *</label>
              <input value={indForm.kode} onChange={(e) => setIndForm((p) => ({ ...p, kode: e.target.value }))} placeholder="SKL-1" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textSecondary, marginBottom: 4 }}>Deskripsi Indikator *</label>
              <input value={indForm.deskripsi} onChange={(e) => setIndForm((p) => ({ ...p, deskripsi: e.target.value }))} placeholder="Deskripsi indikator penilaian..." style={inputStyle} />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={handleIndSave} disabled={indSaving} style={{ padding: "9px 14px", background: T.primary, color: "#fff", border: "none", borderRadius: T.radiusSm, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                {indSaving ? "..." : indEdit ? "Update" : "Tambah"}
              </button>
              {indEdit && (
                <button onClick={() => { setIndEdit(null); setIndForm({ kode: "", deskripsi: "", urutan: "" }); setIndError(""); }} style={{ padding: "9px 10px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 12, cursor: "pointer" }}>
                  Batal
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Daftar indikator */}
        {indLoading ? (
          <div style={{ textAlign: "center", padding: 20, color: T.textMuted }}>Memuat...</div>
        ) : indList.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: T.textMuted }}>Belum ada indikator. Tambah di atas.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {indList.map((ind, i) => (
              <div key={ind.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: indEdit?.id === ind.id ? T.primaryLight : T.bgPage, borderRadius: T.radiusSm, border: `1px solid ${indEdit?.id === ind.id ? T.primary : T.border}` }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.primary, minWidth: 60 }}>{ind.kode}</span>
                <span style={{ flex: 1, fontSize: 13, color: T.textPrimary }}>{ind.deskripsi}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => openIndEdit(ind)} style={btnStyle(T.primary, T.primaryLight)}>{CONFIG.labels.edit}</button>
                  <button onClick={() => handleIndDelete(ind)} style={btnStyle(T.danger, T.dangerLight)}>{CONFIG.labels.hapus}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </Layout>
  );
}
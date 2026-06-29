// Kelola Periode - Admin
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "../../components/Layout.jsx";
import DataTable from "../../components/DataTable.jsx";
import Modal from "../../components/Modal.jsx";
import Pagination from "../../components/Pagination.jsx";
import CONFIG from "../../config.js";
import api from "../../api.js";

const T = CONFIG.theme;

export default function KelolaPeriode() {
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState({ nama: "", aktif: false });
  const [saving, setSaving]     = useState(false);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(CONFIG.defaultPageSize);

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/periode");
      setData(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

const openAdd  = () => { setError(""); setForm({ nama: "", aktif: false }); setModal({ mode: "add" }); };
const openEdit = (row) => { setError(""); setForm({ nama: row.nama, aktif: row.aktif === 1 }); setModal({ mode: "edit", data: row }); };

  const handleSave = useCallback(async () => {
    if (!form.nama.trim()) { setError("Nama periode wajib diisi."); return; }
    setSaving(true); setError("");
    try {
      if (modal.mode === "add") {
        await api.post("/periode", { nama: form.nama.trim(), aktif: form.aktif ? 1 : 0 });
      } else {
        await api.put(`/periode/${modal.data.id}`, { nama: form.nama.trim(), aktif: form.aktif ? 1 : 0 });
      }
      setModal(null); fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan.");
    } finally { setSaving(false); }
  }, [form, modal, fetchData]);

  const handleToggle = useCallback(async (row) => {
    try {
      await api.put(`/periode/${row.id}/toggle`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengubah status.");
    }
  }, [fetchData]);

  const handleDelete = useCallback(async (row) => {
    if (!window.confirm(CONFIG.labels.confirmHapus)) return;
    try { await api.delete(`/periode/${row.id}`); fetchData(); }
    catch (err) { setError(err.response?.data?.message || "Gagal menghapus."); }
  }, [fetchData]);

  const paged = useMemo(() => data.slice((page - 1) * pageSize, page * pageSize), [data, page, pageSize]);
  const inputStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 13, outline: "none", boxSizing: "border-box" };

  const columns = [
    { key: "id", label: "No", width: 48, align: "center", render: (_, __, i) => (page - 1) * pageSize + i + 1 },
    { key: "nama", label: "Nama Periode" },
    { key: "aktif", label: "Status", align: "center", render: (v, r) => (
      <button
        onClick={() => handleToggle(r)}
        style={{
          padding: "4px 12px", border: "none", borderRadius: T.radiusPill,
          cursor: "pointer", fontSize: 12, fontWeight: 600,
          background: v === 1 ? T.successLight : T.bgPage,
          color: v === 1 ? T.success : T.textMuted,
          transition: "all 0.2s",
        }}
      >
        {v === 1 ? "✓ Aktif" : "Nonaktif"}
      </button>
    )},
    { key: "created_at", label: "Dibuat", render: (v) => v ? new Date(v).toLocaleDateString("id-ID") : "-" },
    { key: "aksi", label: "Aksi", align: "center", render: (_, r) => (
      <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
        <button onClick={() => openEdit(r)} style={{ padding: "4px 10px", border: "none", borderRadius: T.radiusSm, background: T.primaryLight, color: T.primary, fontSize: 12, cursor: "pointer" }}>{CONFIG.labels.edit}</button>
        <button onClick={() => handleDelete(r)} style={{ padding: "4px 10px", border: "none", borderRadius: T.radiusSm, background: T.dangerLight, color: T.danger, fontSize: 12, cursor: "pointer" }}>{CONFIG.labels.hapus}</button>
      </div>
    )},
  ];

  return (
    <Layout title="Kelola Periode Audit">
      {error && <div style={{ padding: "10px 14px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 12 }}>⚠️ {error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={openAdd} style={{ padding: "8px 16px", background: T.primary, color: "#fff", border: "none", borderRadius: T.radiusSm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          ＋ {CONFIG.labels.tambah}
        </button>
      </div>
      <DataTable columns={columns} data={paged} loading={loading} />
      <Pagination page={page} pageSize={pageSize} total={data.length} onPageChange={setPage} onPageSizeChange={setPageSize} />

      <Modal
        open={!!modal}
        onClose={() => { setModal(null); setError(""); }}
        title={modal?.mode === "add" ? "Tambah Periode" : "Edit Periode"}
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
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Nama Periode *</label>
            <input value={form.nama} onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))} placeholder="Contoh: Semester Genap 2024/2025" style={inputStyle} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={form.aktif} onChange={(e) => setForm((p) => ({ ...p, aktif: e.target.checked }))} style={{ width: 16, height: 16 }} />
            <span style={{ fontSize: 13, color: T.textPrimary, fontWeight: 500 }}>Jadikan periode aktif</span>
            <span style={{ fontSize: 12, color: T.textMuted }}>(akan menonaktifkan periode lain)</span>
          </label>
        </div>
      </Modal>
    </Layout>
  );
}

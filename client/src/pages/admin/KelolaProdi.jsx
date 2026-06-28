// Kelola Program Studi/Unit - Admin
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "../../components/Layout.jsx";
import DataTable from "../../components/DataTable.jsx";
import Modal from "../../components/Modal.jsx";
import Pagination from "../../components/Pagination.jsx";
import CONFIG from "../../config.js";
import api from "../../api.js";

const T = CONFIG.theme;

export default function KelolaProdi() {
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState({ kode: "", nama: "" });
  const [saving, setSaving]     = useState(false);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(CONFIG.defaultPageSize);

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/prodi");
      setData(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd  = () => { setForm({ kode: "", nama: "" }); setModal({ mode: "add" }); };
  const openEdit = (row) => { setForm({ kode: row.kode, nama: row.nama }); setModal({ mode: "edit", data: row }); };

  const handleSave = useCallback(async () => {
    if (!form.kode.trim() || !form.nama.trim()) { setError("Kode dan nama wajib diisi."); return; }
    setSaving(true); setError("");
    try {
      if (modal.mode === "add") {
        await api.post("/prodi", { kode: form.kode.trim().toUpperCase(), nama: form.nama.trim() });
      } else {
        await api.put(`/prodi/${modal.data.id}`, { kode: form.kode.trim().toUpperCase(), nama: form.nama.trim() });
      }
      setModal(null); fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan.");
    } finally { setSaving(false); }
  }, [form, modal, fetchData]);

  const handleDelete = useCallback(async (row) => {
    if (!window.confirm(CONFIG.labels.confirmHapus)) return;
    try { await api.delete(`/prodi/${row.id}`); fetchData(); }
    catch (err) { setError(err.response?.data?.message || "Gagal menghapus."); }
  }, [fetchData]);

  const paged = useMemo(() => data.slice((page - 1) * pageSize, page * pageSize), [data, page, pageSize]);
  const inputStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 13, outline: "none", boxSizing: "border-box" };
  const btnStyle = (c, bg) => ({ padding: "4px 10px", border: "none", borderRadius: T.radiusSm, background: bg, color: c, fontSize: 12, fontWeight: 500, cursor: "pointer", marginRight: 4 });

  const columns = [
    { key: "id",   label: "No",   width: 48, align: "center", render: (_, __, i) => (page - 1) * pageSize + i + 1 },
    { key: "kode", label: "Kode", width: 100, render: (v) => <span style={{ fontWeight: 700, color: T.primary, fontSize: 13 }}>{v}</span> },
    { key: "nama", label: "Nama Program Studi / Unit" },
    { key: "created_at", label: "Dibuat", render: (v) => v ? new Date(v).toLocaleDateString("id-ID") : "-" },
    { key: "aksi", label: "Aksi", align: "center", render: (_, r) => (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={() => openEdit(r)} style={btnStyle(T.primary, T.primaryLight)}>{CONFIG.labels.edit}</button>
        <button onClick={() => handleDelete(r)} style={btnStyle(T.danger, T.dangerLight)}>{CONFIG.labels.hapus}</button>
      </div>
    )},
  ];

  return (
    <Layout title="Kelola Program Studi / Unit">
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
        title={modal?.mode === "add" ? "Tambah Prodi/Unit" : "Edit Prodi/Unit"}
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
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Kode *</label>
            <input value={form.kode} onChange={(e) => setForm((p) => ({ ...p, kode: e.target.value }))} placeholder="Contoh: PAI" style={{ ...inputStyle, textTransform: "uppercase", width: 120 }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Nama Program Studi / Unit *</label>
            <input value={form.nama} onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))} placeholder="Contoh: Pendidikan Agama Islam" style={inputStyle} />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

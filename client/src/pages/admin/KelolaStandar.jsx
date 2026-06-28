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
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState({ nama: "", urutan: "" });
  const [saving, setSaving]     = useState(false);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(CONFIG.defaultPageSize);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/standar");
      setData(res.data.data.standar || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => setModal({ mode: "add", form: { nama: "", urutan: data.length + 1 } });
  const openEdit = (row) => { setForm({ nama: row.nama, urutan: row.urutan }); setModal({ mode: "edit", data: row }); };

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

  // Saat modal "add" terbuka, sync form state
  useEffect(() => {
    if (modal?.mode === "add") setForm({ nama: "", urutan: data.length + 1 });
  }, [modal, data.length]);

  const paged = useMemo(() => data.slice((page - 1) * pageSize, page * pageSize), [data, page, pageSize]);

  const inputStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 13, color: T.textPrimary, outline: "none", boxSizing: "border-box" };
  const btnStyle = (c, bg) => ({ padding: "4px 10px", border: "none", borderRadius: T.radiusSm, background: bg, color: c, fontSize: 12, fontWeight: 500, cursor: "pointer", marginRight: 4 });

  const columns = [
    { key: "urutan", label: "No", width: 56, align: "center" },
    { key: "nama",   label: "Nama Standar" },
    { key: "created_at", label: "Dibuat", render: (v) => v ? new Date(v).toLocaleDateString("id-ID") : "-" },
    { key: "aksi", label: "Aksi", align: "center", render: (_, r) => (
      <div style={{ display: "flex", justifyContent: "center" }}>
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
    </Layout>
  );
}

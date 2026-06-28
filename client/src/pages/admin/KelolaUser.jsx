// Kelola Pengguna - Admin
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "../../components/Layout.jsx";
import DataTable from "../../components/DataTable.jsx";
import Modal from "../../components/Modal.jsx";
import Pagination from "../../components/Pagination.jsx";
import FilterBar from "../../components/FilterBar.jsx";
import CONFIG from "../../config.js";
import api from "../../api.js";

const T = CONFIG.theme;
const ROLES = ["admin", "auditor", "auditee"];
const ROLE_COLORS = { admin: { color: T.primary, bg: T.primaryLight }, auditor: { color: T.success, bg: T.successLight }, auditee: { color: T.warning, bg: T.warningLight } };

const emptyForm = { nama: "", username: "", password: "", role: "auditor" };

export default function KelolaUser() {
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(CONFIG.defaultPageSize);
  const [filterRole, setFilterRole] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = filterRole ? { role: filterRole } : {};
      const res = await api.get("/users", { params });
      setData(res.data || []);
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data.");
    } finally { setLoading(false); }
  }, [filterRole]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd  = () => { setForm(emptyForm); setModal({ mode: "add" }); };
  const openEdit = (row) => { setForm({ nama: row.nama, username: row.username, password: "", role: row.role }); setModal({ mode: "edit", data: row }); };

  const handleSave = useCallback(async () => {
    if (!form.nama.trim() || !form.username.trim() || !form.role) {
      setError("Nama, username, dan role wajib diisi."); return;
    }
    if (modal.mode === "add" && !form.password.trim()) {
      setError("Password wajib diisi untuk user baru."); return;
    }
    setSaving(true); setError("");
    try {
      const payload = { nama: form.nama.trim(), username: form.username.trim(), role: form.role };
      if (form.password.trim()) payload.password = form.password;
      if (modal.mode === "add") {
        await api.post("/users", payload);
      } else {
        await api.put(`/users/${modal.data.id}`, payload);
      }
      setModal(null); fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan.");
    } finally { setSaving(false); }
  }, [form, modal, fetchData]);

  const handleDelete = useCallback(async (row) => {
    if (!window.confirm(CONFIG.labels.confirmHapus)) return;
    try { await api.delete(`/users/${row.id}`); fetchData(); }
    catch (err) { setError(err.response?.data?.message || "Gagal menghapus."); }
  }, [fetchData]);

  const paged = useMemo(() => data.slice((page - 1) * pageSize, page * pageSize), [data, page, pageSize]);
  const inputStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 13, outline: "none", boxSizing: "border-box" };

  const columns = [
    { key: "id", label: "No", width: 48, align: "center", render: (_, __, i) => (page - 1) * pageSize + i + 1 },
    { key: "avatar", label: "", width: 48, align: "center", render: (v) => (
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, margin: "0 auto" }}>{v}</div>
    )},
    { key: "nama",     label: "Nama Lengkap", render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { key: "username", label: "Username",     render: (v) => <code style={{ fontSize: 12, background: T.bgPage, padding: "2px 6px", borderRadius: 4 }}>{v}</code> },
    { key: "role", label: "Role", render: (v) => {
      const clr = ROLE_COLORS[v] || { color: T.textMuted, bg: T.bgPage };
      return <span style={{ padding: "3px 10px", borderRadius: T.radiusPill, background: clr.bg, color: clr.color, fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{v}</span>;
    }},
    { key: "created_at", label: "Dibuat", render: (v) => v ? new Date(v).toLocaleDateString("id-ID") : "-" },
    { key: "aksi", label: "Aksi", align: "center", render: (_, r) => (
      <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
        <button onClick={() => openEdit(r)} style={{ padding: "4px 10px", border: "none", borderRadius: T.radiusSm, background: T.primaryLight, color: T.primary, fontSize: 12, cursor: "pointer" }}>{CONFIG.labels.edit}</button>
        <button onClick={() => handleDelete(r)} style={{ padding: "4px 10px", border: "none", borderRadius: T.radiusSm, background: T.dangerLight, color: T.danger, fontSize: 12, cursor: "pointer" }}>{CONFIG.labels.hapus}</button>
      </div>
    )},
  ];

  return (
    <Layout title="Kelola Pengguna">
      {error && <div style={{ padding: "10px 14px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 12 }}>⚠️ {error}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <FilterBar
          filters={[{ key: "role", type: "select", label: "Role", options: ROLES.map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) })) }]}
          values={{ role: filterRole }}
          onChange={(_, v) => setFilterRole(v)}
          onReset={() => setFilterRole("")}
        />
        <button onClick={openAdd} style={{ padding: "8px 16px", background: T.primary, color: "#fff", border: "none", borderRadius: T.radiusSm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          ＋ {CONFIG.labels.tambah}
        </button>
      </div>
      <DataTable columns={columns} data={paged} loading={loading} />
      <Pagination page={page} pageSize={pageSize} total={data.length} onPageChange={setPage} onPageSizeChange={setPageSize} />

      <Modal
        open={!!modal}
        onClose={() => { setModal(null); setError(""); }}
        title={modal?.mode === "add" ? "Tambah Pengguna" : "Edit Pengguna"}
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
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Nama Lengkap *</label>
            <input value={form.nama} onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))} placeholder="Nama lengkap" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Username *</label>
            <input value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} placeholder="username" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>
              Password {modal?.mode === "edit" && <span style={{ color: T.textMuted, fontWeight: 400 }}>(kosongkan jika tidak diubah)</span>}
              {modal?.mode === "add" && " *"}
            </label>
            <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder={modal?.mode === "edit" ? "Biarkan kosong jika tidak diubah" : "Password"} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Role *</label>
            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} style={inputStyle}>
              {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

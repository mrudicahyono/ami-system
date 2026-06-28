// Kelola Instrumen - Admin
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

const emptyForm = {
  standar_id: "", prodi_id: "", periode_id: "",
  auditor1_id: "", auditor2_id: "", auditee_id: "",
};

export default function KelolaInstrumen() {
  const [data, setData]           = useState([]);
  const [standarList, setStandar] = useState([]);
  const [prodiList, setProdi]     = useState([]);
  const [periodeList, setPeriode] = useState([]);
  const [userList, setUsers]      = useState([]);
  const [skorConfig, setSkor]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [modal, setModal]         = useState(null); // null | { mode: 'add'|'edit', data? }
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(CONFIG.defaultPageSize);
  const [filters, setFilters]     = useState({ standar_id: "", prodi_id: "", status: "" });

  // Fetch semua referensi data
  const fetchRefs = useCallback(async () => {
    try {
      const [s, p, per, u, sk] = await Promise.all([
        api.get("/standar"),
        api.get("/prodi"),
        api.get("/periode"),
        api.get("/users"),
        api.get("/skor-config"),
      ]);
      setStandar(s.data || []);
      setProdi(p.data || []);
      setPeriode(per.data || []);
      setUsers(u.data || []);
      setSkor(sk.data || []);
    } catch {}
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.standar_id) params.standar_id = filters.standar_id;
      if (filters.prodi_id)   params.prodi_id   = filters.prodi_id;
      if (filters.status)     params.status     = filters.status;
      const res = await api.get("/instrumen", { params });
      setData(res.data);
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchRefs(); }, [fetchRefs]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = useCallback(() => {
    const periodeAktif = periodeList.find((p) => p.aktif === 1);
    setForm({ ...emptyForm, periode_id: periodeAktif?.id || "" });
    setModal({ mode: "add" });
  }, [periodeList]);

  const openEdit = useCallback((row) => {
    setForm({
      standar_id:  row.standar_id || "",
      prodi_id:    row.prodi_id   || "",
      periode_id:  row.periode_id || "",
      auditor1_id: row.auditor1_id || "",
      auditor2_id: row.auditor2_id || "",
      auditee_id:  row.auditee_id  || "",
    });
    setModal({ mode: "edit", data: row });
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.standar_id || !form.prodi_id || !form.periode_id) {
      setError("Standar, program studi, dan periode wajib dipilih.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        standar_id:  Number(form.standar_id),
        prodi_id:    Number(form.prodi_id),
        periode_id:  Number(form.periode_id),
        auditor1_id: form.auditor1_id ? Number(form.auditor1_id) : null,
        auditor2_id: form.auditor2_id ? Number(form.auditor2_id) : null,
        auditee_id:  form.auditee_id  ? Number(form.auditee_id)  : null,
      };
      if (modal.mode === "add") {
        await api.post("/instrumen", payload);
      } else {
        await api.put(`/instrumen/${modal.data.id}`, payload);
      }
      setModal(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  }, [form, modal, fetchData]);

  const handleDelete = useCallback(async (row) => {
    if (!window.confirm(CONFIG.labels.confirmHapus)) return;
    try {
      await api.delete(`/instrumen/${row.id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghapus.");
    }
  }, [fetchData]);

  const handleFilterChange = useCallback((key, val) => {
    setFilters((p) => ({ ...p, [key]: val }));
  }, []);

  // Paginasi client-side
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const auditors = useMemo(() => userList.filter((u) => u.role === "auditor"), [userList]);
  const auditees = useMemo(() => userList.filter((u) => u.role === "auditee"), [userList]);

  const btnStyle = (color, bg) => ({
    padding: "4px 10px", border: "none", borderRadius: T.radiusSm,
    background: bg, color, fontSize: 12, fontWeight: 500,
    cursor: "pointer", marginRight: 4,
  });

  const columns = [
    { key: "no",    label: "No",       width: 48,  align: "center", render: (_, __, i) => (page - 1) * pageSize + i + 1 },
    { key: "standar_nama",  label: "Standar",  render: (_, r) => <span style={{ fontSize: 13 }}>{r.standar_nama || "-"}</span> },
    { key: "prodi_nama", label: "Prodi", render: (_, r) => (
      <span>
        <span style={{ fontWeight: 600, fontSize: 12, color: T.primary }}>{r.prodi_kode}</span>
        <span style={{ fontSize: 12, color: T.textSecondary, marginLeft: 4 }}>{r.prodi_nama}</span>
      </span>
)},
    { key: "auditor1", label: "Auditor 1", render: (_, r) => <span style={{ fontSize: 13 }}>{r.auditor1_nama || "-"}</span> },
    { key: "auditor2", label: "Auditor 2", render: (_, r) => <span style={{ fontSize: 13 }}>{r.auditor2_nama || "-"}</span> },
    { key: "auditee",  label: "Auditee",   render: (_, r) => <span style={{ fontSize: 13 }}>{r.auditee_nama || "-"}</span> },
    { key: "status",   label: "Status",    render: (_, r) => <StatusBadge status={r.status} /> },
    { key: "skor",     label: "Skor",      align: "center", render: (_, r) => <SkorBadge skor={r.hasil_audit?.skor} skorConfig={skorConfig} /> },
    { key: "aksi",     label: "Aksi",      align: "center", render: (_, r) => (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={() => openEdit(r)} style={btnStyle(T.primary, T.primaryLight)}>{CONFIG.labels.edit}</button>
        <button onClick={() => handleDelete(r)} style={btnStyle(T.danger, T.dangerLight)}>{CONFIG.labels.hapus}</button>
      </div>
    )},
  ];

  const inputStyle = {
    width: "100%", padding: "9px 12px",
    border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
    fontSize: 13, color: T.textPrimary,
    background: T.bgCard, outline: "none", boxSizing: "border-box",
  };

  return (
    <Layout title="Kelola Instrumen Audit">
      {error && (
        <div style={{ padding: "10px 14px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 12 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <FilterBar
          filters={[
            { key: "standar_id", type: "select", label: "Standar", options: standarList.map((s) => ({ value: s.id, label: s.nama })) },
            { key: "prodi_id",   type: "select", label: "Prodi",   options: prodiList.map((p) => ({ value: p.id, label: `${p.kode} - ${p.nama}` })) },
            { key: "status",     type: "select", label: "Status",  options: [
              { value: "belum", label: "Belum Diisi" },
              { value: "diisi", label: "Sudah Diisi" },
              { value: "proses", label: "Proses Audit" },
              { value: "selesai", label: "Selesai" },
            ]},
          ]}
          values={filters}
          onChange={handleFilterChange}
          onReset={() => setFilters({ standar_id: "", prodi_id: "", status: "" })}
        />
        <button
          onClick={openAdd}
          style={{
            padding: "8px 16px", background: T.primary, color: "#fff",
            border: "none", borderRadius: T.radiusSm, fontSize: 13,
            fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          ＋ {CONFIG.labels.tambah}
        </button>
      </div>

      <DataTable columns={columns} data={paginatedData} loading={loading} />

      <Pagination
        page={page} pageSize={pageSize} total={data.length}
        onPageChange={setPage} onPageSizeChange={setPageSize}
      />

      {/* Modal form */}
      <Modal
        open={!!modal}
        onClose={() => { setModal(null); setError(""); }}
        title={modal?.mode === "add" ? "Tambah Instrumen" : "Edit Instrumen"}
        footer={
          <>
            <button onClick={() => { setModal(null); setError(""); }} style={{ padding: "8px 18px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, background: T.bgCard, color: T.textPrimary, fontSize: 13, cursor: "pointer" }}>
              {CONFIG.labels.batal}
            </button>
            <button onClick={handleSave} disabled={saving} style={{ padding: "8px 18px", background: T.primary, color: "#fff", border: "none", borderRadius: T.radiusSm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "Menyimpan..." : CONFIG.labels.simpan}
            </button>
          </>
        }
      >
        {error && <div style={{ padding: "8px 12px", background: T.dangerLight, color: T.danger, borderRadius: T.radiusSm, marginBottom: 12, fontSize: 13 }}>⚠️ {error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Standar *</label>
            <select value={form.standar_id} onChange={(e) => setForm((p) => ({ ...p, standar_id: e.target.value }))} style={inputStyle}>
              <option value="">Pilih Standar</option>
              {standarList.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Program Studi *</label>
            <select value={form.prodi_id} onChange={(e) => setForm((p) => ({ ...p, prodi_id: e.target.value }))} style={inputStyle}>
              <option value="">Pilih Prodi</option>
              {prodiList.map((p) => <option key={p.id} value={p.id}>{p.kode} - {p.nama}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Periode *</label>
            <select value={form.periode_id} onChange={(e) => setForm((p) => ({ ...p, periode_id: e.target.value }))} style={inputStyle}>
              <option value="">Pilih Periode</option>
              {periodeList.map((p) => <option key={p.id} value={p.id}>{p.nama}{p.aktif ? " ✓" : ""}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Auditor 1</label>
            <select value={form.auditor1_id} onChange={(e) => setForm((p) => ({ ...p, auditor1_id: e.target.value }))} style={inputStyle}>
              <option value="">Tidak ditugaskan</option>
              {auditors.map((u) => <option key={u.id} value={u.id}>{u.nama}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Auditor 2</label>
            <select value={form.auditor2_id} onChange={(e) => setForm((p) => ({ ...p, auditor2_id: e.target.value }))} style={inputStyle}>
              <option value="">Tidak ditugaskan</option>
              {auditors.map((u) => <option key={u.id} value={u.id}>{u.nama}</option>)}
            </select>
          </div>

          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Auditee</label>
            <select value={form.auditee_id} onChange={(e) => setForm((p) => ({ ...p, auditee_id: e.target.value }))} style={inputStyle}>
              <option value="">Tidak ditugaskan</option>
              {auditees.map((u) => <option key={u.id} value={u.id}>{u.nama}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

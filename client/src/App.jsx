// App.jsx - Router utama + AuthContext
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import CONFIG from "./config.js";
import api from "./api.js";

// ─── Auth Context ─────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("ami_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    const { token, user: userData } = res.data.data;
    localStorage.setItem(CONFIG.tokenKey, token);
    localStorage.setItem("ami_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CONFIG.tokenKey);
    localStorage.removeItem("ami_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Protected Route ──────────────────────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const token = localStorage.getItem(CONFIG.tokenKey);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}

// ─── Redirect berdasar role setelah login ─────────────────────────────────────
function RoleRedirect() {
  const { user } = useAuth();
  const token = localStorage.getItem(CONFIG.tokenKey);

  if (!token || !user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
}

// ─── Lazy imports halaman ─────────────────────────────────────────────────────
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import KelolaInstrumen from "./pages/admin/KelolaInstrumen.jsx";
import KelolaStandar from "./pages/admin/KelolaStandar.jsx";
import KelolaProdi from "./pages/admin/KelolaProdi.jsx";
import KelolaPeriode from "./pages/admin/KelolaPeriode.jsx";
import KelolaUser from "./pages/admin/KelolaUser.jsx";
import KonfigurasiSkor from "./pages/admin/KonfigurasiSkor.jsx";
import Laporan from "./pages/admin/Laporan.jsx";
import AuditorDashboard from "./pages/auditor/Dashboard.jsx";
import InstrumenAudit from "./pages/auditor/InstrumenAudit.jsx";
import AuditeeDashboard from "./pages/auditee/Dashboard.jsx";
import EvaluasiDiri from "./pages/auditee/EvaluasiDiri.jsx";

// ─── App Router ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Halaman login */}
          <Route path="/login" element={<Login />} />

          {/* Redirect root ke role dashboard */}
          <Route path="/" element={<RoleRedirect />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/instrumen" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KelolaInstrumen />
            </ProtectedRoute>
          } />
          <Route path="/admin/standar" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KelolaStandar />
            </ProtectedRoute>
          } />
          <Route path="/admin/prodi" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KelolaProdi />
            </ProtectedRoute>
          } />
          <Route path="/admin/periode" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KelolaPeriode />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KelolaUser />
            </ProtectedRoute>
          } />
          <Route path="/admin/skor" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KonfigurasiSkor />
            </ProtectedRoute>
          } />
          <Route path="/admin/laporan" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Laporan />
            </ProtectedRoute>
          } />

          {/* Auditor routes */}
          <Route path="/auditor/dashboard" element={
            <ProtectedRoute allowedRoles={["auditor"]}>
              <AuditorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/auditor/instrumen" element={
            <ProtectedRoute allowedRoles={["auditor"]}>
              <InstrumenAudit />
            </ProtectedRoute>
          } />

          {/* Auditee routes */}
          <Route path="/auditee/dashboard" element={
            <ProtectedRoute allowedRoles={["auditee"]}>
              <AuditeeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/auditee/instrumen" element={
            <ProtectedRoute allowedRoles={["auditee"]}>
              <EvaluasiDiri />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

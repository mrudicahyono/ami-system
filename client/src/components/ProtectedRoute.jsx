// ProtectedRoute — cek token dan role sebelum render halaman
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../App";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  // Jika belum login, arahkan ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika role tidak sesuai, arahkan ke dashboard role yang benar
  if (role && user.role !== role) {
    const redirectMap = {
      admin: "/admin/dashboard",
      auditor: "/auditor/dashboard",
      auditee: "/auditee/dashboard",
    };
    return <Navigate to={redirectMap[user.role] || "/login"} replace />;
  }

  return children;
}

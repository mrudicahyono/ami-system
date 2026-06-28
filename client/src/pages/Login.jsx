// Halaman login AMI
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App.jsx";
import CONFIG from "../config.js";

const T = CONFIG.theme;

const demoAccounts = [
  { role: "Admin",   username: "admin",    password: "admin123" },
  { role: "Auditor", username: "auditor1", password: "auditor123" },
  { role: "Auditee", username: "auditee1", password: "auditee123" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Username dan password wajib diisi.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await login(form.username.trim(), form.password);
      navigate(`/${user.role}/dashboard`, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Login gagal. Periksa username dan password."
      );
    } finally {
      setLoading(false);
    }
  }, [form, login, navigate]);

  const fillDemo = useCallback((username, password) => {
    setForm({ username, password });
    setError("");
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, fontFamily: T.fontFamily,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Header card */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: T.radius,
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, margin: "0 auto 12px",
            backdropFilter: "blur(4px)",
          }}>
            {CONFIG.logoEmoji}
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>
            {CONFIG.labels.loginTitle}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: 0 }}>
            {CONFIG.labels.loginSubtitle}
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: T.bgCard, borderRadius: T.radius,
          padding: "28px 28px 24px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}>
          <form onSubmit={handleSubmit}>
            {/* Error message */}
            {error && (
              <div style={{
                padding: "10px 14px", marginBottom: 16,
                background: T.dangerLight, color: T.danger,
                borderRadius: T.radiusSm, fontSize: 13,
                border: `1px solid #FCA5A5`,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Username */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.textPrimary, marginBottom: 6 }}>
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                placeholder="Masukkan username"
                autoComplete="username"
                style={{
                  width: "100%", padding: "10px 14px",
                  border: `1.5px solid ${T.border}`,
                  borderRadius: T.radiusSm, fontSize: 14,
                  color: T.textPrimary, outline: "none",
                  transition: "border-color 0.15s", boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = T.primary}
                onBlur={(e) => e.target.style.borderColor = T.border}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.textPrimary, marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  style={{
                    width: "100%", padding: "10px 40px 10px 14px",
                    border: `1.5px solid ${T.border}`,
                    borderRadius: T.radiusSm, fontSize: 14,
                    color: T.textPrimary, outline: "none",
                    transition: "border-color 0.15s", boxSizing: "border-box",
                  }}
                  onFocus={(e) => e.target.style.borderColor = T.primary}
                  onBlur={(e) => e.target.style.borderColor = T.border}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)", border: "none",
                    background: "none", cursor: "pointer",
                    fontSize: 15, color: T.textMuted, padding: 0,
                  }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Tombol login */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "11px",
                background: loading ? T.textMuted : T.primary,
                color: "#fff", border: "none",
                borderRadius: T.radiusSm, fontSize: 14,
                fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = T.primaryDark; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = T.primary; }}
            >
              {loading ? "Memproses..." : CONFIG.labels.loginButton}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "20px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: T.border }} />
            <span style={{ fontSize: 12, color: T.textMuted }}>Akun Demo</span>
            <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>

          {/* Akun demo */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {demoAccounts.map((acc) => (
              <button
                key={acc.username}
                onClick={() => fillDemo(acc.username, acc.password)}
                style={{
                  flex: 1, padding: "7px 10px",
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radiusSm,
                  background: T.bgPage, color: T.textSecondary,
                  fontSize: 12, cursor: "pointer",
                  transition: "all 0.15s", whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = T.primaryLight;
                  e.currentTarget.style.color = T.primary;
                  e.currentTarget.style.borderColor = T.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = T.bgPage;
                  e.currentTarget.style.color = T.textSecondary;
                  e.currentTarget.style.borderColor = T.border;
                }}
              >
                {acc.role}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 20 }}>
          © {new Date().getFullYear()} {CONFIG.namaUniversitas}
        </p>
      </div>
    </div>
  );
}

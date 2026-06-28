import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App.jsx";
import CONFIG from "../config.js";

const demoAccounts = [
  { role: "Admin",   username: "admin",       password: "admin123" },
  { role: "Auditor", username: "auditor1",    password: "audit123" },
  { role: "Auditee", username: "auditee_pai", password: "auditee123" },
];

// Ganti URL ini dengan gambar kampus UIT Lirboyo
const BG_IMAGE = "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGJwwEnL7-7dWa9Y2TgYiJiidzEhpPRMrt0-xmUEsrCkbuZYfEKv92e1DtpJqBbZXwkQKsMoNYJsGXKOzDxh_Unbd0WrhF9XKznid1K1kp4THYT6RmiXf3og_0oMUTZSXbQFxtH=s1360-w1360-h1020-rw";

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
      setError(err.response?.data?.message || "Login gagal. Periksa username dan password.");
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
      minHeight: "100vh", display: "flex",
      background: "#F8FAFC", fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* Panel kiri — gambar */}
      <div className="login-left" style={{
        flex: "0 0 45%", position: "relative",
        overflow: "hidden", minHeight: "100vh",
      }}>
        {/* Gambar background */}
        <img
          src={BG_IMAGE}
          alt="Kampus"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
          }}
        />
        {/* Overlay gelap */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(160deg, rgba(15,23,42,0.7) 0%, rgba(22,163,74,0.75) 100%)",
        }} />
        {/* Konten di atas overlay */}
        <div style={{
          position: "relative", zIndex: 1,
          height: "100%", display: "flex",
          flexDirection: "column", justifyContent: "space-between",
          padding: "40px",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, border: "1px solid rgba(255,255,255,0.2)",
            }}>
              {CONFIG.logoEmoji}
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
                {CONFIG.namaAplikasi}
              </div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                {CONFIG.tagline}
              </div>
            </div>
          </div>

          {/* Quote bawah */}
          <div style={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 16, padding: "24px",
          }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", lineHeight: 1.7, marginBottom: 16 }}>
              "Sistem Audit Mutu Internal yang transparan dan terstruktur adalah fondasi untuk mewujudkan pendidikan tinggi yang berkualitas dan berdaya saing."
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>🏛️</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>
                  {CONFIG.namaUniversitas}
                </div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>
                  Lembaga Penjaminan Mutu
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel kanan — form */}
      <div style={{
        flex: 1, display: "flex",
        alignItems: "center", justifyContent: "center",
        padding: "40px 32px",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Judul */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontSize: 28, fontWeight: 700,
              color: "#0F172A", margin: "0 0 8px",
              letterSpacing: "-0.5px",
            }}>
              Selamat Datang
            </h1>
            <p style={{ fontSize: 14, color: "#64748B", margin: 0, lineHeight: 1.6 }}>
              Silakan masuk dengan akun yang telah didaftarkan oleh administrator.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "12px 16px", marginBottom: 20,
              background: "#FEF2F2", color: "#DC2626",
              borderRadius: 10, fontSize: 13,
              border: "1px solid #FCA5A5",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: "block", fontSize: 13, fontWeight: 600,
                color: "#374151", marginBottom: 8,
              }}>
                Username
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)", fontSize: 15, color: "#9CA3AF",
                }}>👤</span>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                  placeholder="Masukkan username"
                  autoComplete="username"
                  style={{
                    width: "100%", padding: "12px 14px 12px 40px",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: 10, fontSize: 14,
                    color: "#111827", outline: "none",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    boxSizing: "border-box", background: "#fff",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563EB";
                    e.target.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E5E7EB";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: "block", fontSize: 13, fontWeight: 600,
                color: "#374151", marginBottom: 8,
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)", fontSize: 15, color: "#9CA3AF",
                }}>🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  style={{
                    width: "100%", padding: "12px 44px 12px 40px",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: 10, fontSize: 14,
                    color: "#111827", outline: "none",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    boxSizing: "border-box", background: "#fff",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563EB";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E5E7EB";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)", border: "none",
                    background: "none", cursor: "pointer",
                    fontSize: 15, color: "#9CA3AF", padding: 4,
                  }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Tombol masuk */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px",
                background: loading ? "#86EFAC" : "#16A34A",
                color: "#fff", border: "none",
                borderRadius: 10, fontSize: 15,
                fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s, transform 0.1s",
                boxShadow: "0 4px 14px rgba(22,163,74,0.35)",
                letterSpacing: "0.2px",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#15803D"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#16A34A"; }}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Divider akun demo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "24px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
            <span style={{ fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" }}>Akun Demo</span>
            <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {demoAccounts.map((acc) => (
              <button
                key={acc.username}
                onClick={() => fillDemo(acc.username, acc.password)}
                style={{
                  flex: 1, padding: "9px 8px",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 10, background: "#fff",
                  color: "#374151", fontSize: 12,
                  fontWeight: 500, cursor: "pointer",
                  transition: "all 0.15s", whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#16A34A";
                  e.currentTarget.style.color = "#2563EB";
                  e.currentTarget.style.background = "#F0FDF4";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.color = "#374151";
                  e.currentTarget.style.background = "#fff";
                }}
              >
                {acc.role}
              </button>
            ))}
          </div>

          {/* Footer */}
          <p style={{
            textAlign: "center", fontSize: 12,
            color: "#9CA3AF", marginTop: 32,
          }}>
            © {new Date().getFullYear()} {CONFIG.namaUniversitas}
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-left { display: none !important; }
        }
      `}</style>
    </div>
  );
}
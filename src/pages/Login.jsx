import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
//  .... logo image
import logo from "../assets/mk logo.png"; // adjust path if needed

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await login({ email, password });
      if (response?.user) {
        authLogin(response.user); // update AuthContext
        navigate("/");
      } else {
        setError("Login failed – please try again.");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "#07071a",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: "absolute", width: 600, height: 600,
        borderRadius: "50%", top: "-200px", left: "-200px",
        background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
        animation: "floatOrb 8s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 500, height: 500,
        borderRadius: "50%", bottom: "-150px", right: "-150px",
        background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)",
        animation: "floatOrb 10s ease-in-out infinite reverse",
      }} />
      <div style={{
        position: "absolute", width: 300, height: 300,
        borderRadius: "50%", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
        animation: "floatOrb 6s ease-in-out infinite",
      }} />

      {/* Grid pattern overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Left: Branding Panel */}
      <div style={{
        display: "none",
        width: "50%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px",
        position: "relative",
      }} className="left-panel">
        <div style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          textAlign: "center",
        }}>
          {/* Logo */}
          <img src={logo} />
          <h1 style={{
            fontSize: 48, fontWeight: 800, margin: "0 0 16px",
            background: "linear-gradient(135deg, #a78bfa, #67e8f9, #f9a8d4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            lineHeight: 1.1,
          }}>Start Chatting</h1>
          <p style={{ color: "rgba(167,139,250,0.6)", fontSize: 18, lineHeight: 1.7, maxWidth: 360 }}>
            Real-time messaging with end-to-end encryption. Connect with your team seamlessly.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 40, justifyContent: "center" }}>
            {["💬 Real-time", "🔒 Secure", "📁 File Sharing", "👥 Groups"].map(tag => (
              <span key={tag} style={{
                padding: "8px 14px", borderRadius: 99,
                background: "rgba(124,58,237,0.15)",
                border: "1px solid rgba(124,58,237,0.3)",
                color: "#a78bfa", fontSize: 12, fontWeight: 600,
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right / Center: Login Form */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "24px", position: "relative", zIndex: 10,
      }}>
        <div style={{
          width: "100%", maxWidth: 440,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(40px)",
          transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
        }}>
          {/* Card */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(124,58,237,0.2)",
            borderRadius: 28,
            padding: "44px 40px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <img src={logo} />
              <h2 style={{
                margin: "0 0 8px", fontSize: 28, fontWeight: 700,
                background: "linear-gradient(135deg, #f0f0ff, #a78bfa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Welcome back</h2>
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.3)",
                borderRadius: 12, padding: "12px 16px", marginBottom: 20,
                color: "#fb7185", fontSize: 14, display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(167,139,250,0.7)", marginBottom: 8 }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = "rgba(124,58,237,0.7)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(124,58,237,0.2)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(167,139,250,0.7)", marginBottom: 8 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{ ...inputStyle, paddingRight: 48 }}
                    onFocus={e => { e.target.style.borderColor = "rgba(124,58,237,0.7)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(124,58,237,0.2)"; e.target.style.boxShadow = "none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    style={{
                      position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "rgba(167,139,250,0.5)", fontSize: 18, lineHeight: 1,
                      padding: 4,
                    }}
                  >{showPass ? "🙈" : "👁"}</button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: "100%", padding: "15px",
                  borderRadius: 14, border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: 15, fontWeight: 700, color: "white", marginTop: 4,
                  background: loading
                    ? "rgba(124,58,237,0.4)"
                    : "linear-gradient(135deg, #7c3aed, #06b6d4)",
                  boxShadow: loading ? "none" : "0 8px 30px rgba(124,58,237,0.4)",
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
                onMouseEnter={e => { if (!loading) { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 40px rgba(124,58,237,0.5)"; } }}
                onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 8px 30px rgba(124,58,237,0.4)"; }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid white", borderRadius: "50%",
                      animation: "spin 0.8s linear infinite", display: "inline-block",
                    }} />
                    Signing in...
                  </>
                ) : "Sign In →"}
              </button>
            </div>

            {/* Footer link */}
            <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "rgba(167,139,250,0.5)" }}>
              Don't have an account?{" "}
              <Link to="/signup" style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}>
                Create one →
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        .left-panel { display: flex !important; }
        @media (max-width: 768px) { .left-panel { display: none !important; } }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 12,
  border: "1px solid rgba(124,58,237,0.2)",
  background: "rgba(255,255,255,0.04)",
  color: "#f0f0ff",
  fontSize: 14,
  outline: "none",
  transition: "all 0.2s",
  boxSizing: "border-box",
  fontFamily: "'DM Sans', sans-serif",
};
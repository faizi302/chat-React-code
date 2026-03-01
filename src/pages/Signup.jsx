// src/pages/Signup.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup, uploadFile } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", profileImage: "",
  });
  const [error, setError]           = useState(null);
  const [loading, setLoading]       = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);   // separate from form error
  const [showPass, setShowPass]     = useState(false);
  const [preview, setPreview]       = useState(null);
  const [mounted, setMounted]       = useState(false);
  const fileRef = useRef(null);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  useEffect(() => { setMounted(true); }, []);

  const set = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  // ── Compress image in browser using canvas ──────────────────
  const compressImage = (file, maxWidth = 900, quality = 0.82) => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        let { width, height } = img;

        // Only resize if larger than maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width  = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
              type: "image/jpeg",
            }));
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file); // fallback: use original
      };

      img.src = objectUrl;
    });
  };

  // ── Handle file selection ───────────────────────────────────
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Show instant preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    setUploadProgress(15);

    try {
      // Compress in browser first
      const compressed = await compressImage(file);
      setUploadProgress(45);

      console.log(
        `Compressed: ${Math.round(file.size / 1024)}KB → ${Math.round(compressed.size / 1024)}KB`
      );

      // Upload to server
      const result = await uploadFile(compressed);
      setUploadProgress(100);

      if (result?.url) {
        setForm(prev => ({ ...prev, profileImage: result.url }));
        console.log("✅ Image uploaded:", result.url);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      // Show the upload error separately — don't block signup
      setUploadError(`Photo upload failed: ${err.message}. You can still sign up without a photo.`);
      setPreview(null);
      setForm(prev => ({ ...prev, profileImage: "" }));
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 800);
    }
  };

  // ── Handle form submit ──────────────────────────────────────
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);

    // Basic validation
    if (!form.name.trim())         return setError("Name is required");
    if (!form.email.trim())        return setError("Email is required");
    if (form.password.length < 6)  return setError("Password must be at least 6 characters");
    if (!form.phone.trim())        return setError("Phone number is required");

    if (uploading) return setError("Please wait for the image upload to finish");

    setLoading(true);
    try {
      const response = await signup(form);
      if (response?.user) {
        authLogin(response.user);
        navigate("/");
      } else {
        setError("Signup failed — unexpected response from server");
      }
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#07071a",
      padding: "24px",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background orbs */}
      <div style={{ position:"absolute", width:700, height:700, borderRadius:"50%", top:"-300px", right:"-200px", background:"radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", bottom:"-200px", left:"-100px", background:"radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(6,182,212,0.025) 1px, transparent 1px),linear-gradient(90deg, rgba(6,182,212,0.025) 1px, transparent 1px)", backgroundSize:"40px 40px", pointerEvents:"none" }} />

      {/* Card */}
      <div style={{
        width:"100%", maxWidth:460, position:"relative", zIndex:10,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
      }}>
<div style={{
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(124,58,237,0.2)",
  borderRadius: 26,
  padding: "40px 36px",
  boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",

  // ── Add these three lines ───────────────────────────────
  maxHeight: "85vh",               // or 82vh / 88vh — play with this value
  overflowY: "auto",               // enables vertical scroll when needed
  WebkitOverflowScrolling: "touch", // smooth scrolling on iOS
}}>

          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{
              width:52, height:52, borderRadius:14, margin:"0 auto 16px",
              background:"linear-gradient(135deg,#7c3aed,#06b6d4)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:24, boxShadow:"0 0 28px rgba(124,58,237,0.4)",
            }}>⚡</div>
            <h2 style={{ margin:"0 0 6px", fontSize:24, fontWeight:700, background:"linear-gradient(135deg,#f0f0ff,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Create account
            </h2>
            <p style={{ color:"rgba(167,139,250,0.5)", fontSize:13, margin:0 }}>Join StandardChat today</p>
          </div>

          {/* Form error */}
          {error && (
            <div style={{ background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.3)", borderRadius:10, padding:"11px 14px", marginBottom:18, color:"#fb7185", fontSize:13, display:"flex", gap:8, alignItems:"flex-start" }}>
              <span style={{ flexShrink:0 }}>⚠</span> {error}
            </div>
          )}

          {/* Upload error (non-blocking) */}
          {uploadError && (
            <div style={{ background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.25)", borderRadius:10, padding:"11px 14px", marginBottom:18, color:"#fbbf24", fontSize:12, display:"flex", gap:8, alignItems:"flex-start" }}>
              <span style={{ flexShrink:0 }}>📷</span> {uploadError}
            </div>
          )}

          {/* Profile image picker */}
          <div style={{ textAlign:"center", marginBottom:22 }}>
            <div
              onClick={() => !uploading && fileRef.current?.click()}
              style={{
                width:84, height:84, borderRadius:"50%", margin:"0 auto 10px",
                background: preview ? "transparent" : "rgba(124,58,237,0.08)",
                border:"2px dashed rgba(124,58,237,0.35)",
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor: uploading ? "wait" : "pointer",
                overflow:"hidden", position:"relative",
                transition:"border-color 0.2s",
              }}
              onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = "rgba(124,58,237,0.7)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.35)"; }}
            >
              {preview ? (
                <img src={preview} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              ) : (
                <span style={{ fontSize:28 }}>📷</span>
              )}

              {/* Upload overlay */}
              {uploading && (
                <div style={{ position:"absolute", inset:0, background:"rgba(7,7,26,0.75)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4 }}>
                  <div style={{ width:22, height:22, border:"2px solid rgba(167,139,250,0.3)", borderTop:"2px solid #a78bfa", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                  <span style={{ fontSize:9, color:"#a78bfa", fontWeight:700 }}>{uploadProgress}%</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display:"none" }} />

            {/* Progress bar */}
            {uploading && (
              <div style={{ height:2, background:"rgba(124,58,237,0.15)", borderRadius:99, margin:"0 auto", width:80 }}>
                <div style={{ height:"100%", borderRadius:99, width:`${uploadProgress}%`, background:"linear-gradient(90deg,#7c3aed,#06b6d4)", transition:"width 0.3s" }} />
              </div>
            )}

            <p style={{ fontSize:11, color:"rgba(167,139,250,0.35)", margin:"6px 0 0" }}>
              {uploading ? `Compressing & uploading... ${uploadProgress}%` : "Click to add photo (optional)"}
            </p>
          </div>

          {/* Fields */}
          <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
            <Field label="Full Name">
              <input type="text" placeholder="John Doe" value={form.name} onChange={set("name")} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </Field>

            <Field label="Email Address">
              <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </Field>

            <Field label="Password">
              <div style={{ position:"relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set("password")}
                  style={{ ...inputStyle, paddingRight:44 }}
                  onFocus={onFocus} onBlur={onBlur}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(167,139,250,0.45)", fontSize:16 }}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </Field>

            <Field label="Phone Number">
              <input type="tel" placeholder="e.g. 03001234567" value={form.phone} onChange={set("phone")} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </Field>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || uploading}
              style={{
                width:"100%", padding:"14px", borderRadius:12, border:"none",
                cursor:(loading || uploading) ? "not-allowed" : "pointer",
                fontSize:14, fontWeight:700, color:"white", marginTop:4,
                background:(loading || uploading) ? "rgba(124,58,237,0.35)" : "linear-gradient(135deg,#7c3aed,#06b6d4)",
                boxShadow:(loading || uploading) ? "none" : "0 8px 28px rgba(124,58,237,0.4)",
                transition:"all 0.2s",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              }}
            >
              {loading ? (
                <>
                  <span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid white", borderRadius:"50%", animation:"spin 0.8s linear infinite", display:"inline-block" }} />
                  Creating account...
                </>
              ) : uploading ? "Uploading image..." : "Create Account →"}
            </button>
          </div>

          <p style={{ textAlign:"center", marginTop:20, fontSize:13, color:"rgba(167,139,250,0.45)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color:"#a78bfa", fontWeight:600, textDecoration:"none" }}>Sign in →</Link>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(167,139,250,0.22); }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(167,139,250,0.55)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.07em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width:"100%", padding:"11px 14px", borderRadius:10,
  border:"1px solid rgba(124,58,237,0.2)",
  background:"rgba(255,255,255,0.04)",
  color:"#f0f0ff", fontSize:13, outline:"none",
  transition:"all 0.18s", boxSizing:"border-box",
  fontFamily:"'DM Sans', sans-serif",
};

const onFocus = (e) => {
  e.target.style.borderColor = "rgba(124,58,237,0.65)";
  e.target.style.background  = "rgba(124,58,237,0.07)";
  e.target.style.boxShadow   = "0 0 0 3px rgba(124,58,237,0.08)";
};
const onBlur = (e) => {
  e.target.style.borderColor = "rgba(124,58,237,0.2)";
  e.target.style.background  = "rgba(255,255,255,0.04)";
  e.target.style.boxShadow   = "none";
};
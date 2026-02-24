// src/components/EditProfileModal.jsx
import React, { useState, useRef } from "react";
import { Camera, X, Check } from "lucide-react";
import { uploadFile, updateUser } from "../api/api";
import { useAuth } from "../context/AuthContext";

// Compress image in browser before uploading
const compressImage = (file, maxWidth = 900, quality = 0.82) =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          resolve(new File([blob], "profile.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });

export default function EditProfileModal({ onClose }) {
  const { currentUser, updateCurrentUser } = useAuth();
  const fileRef = useRef();

  // The backend uses "name" field — we show it as "Display Name"
  const [name, setName]         = useState(currentUser?.name || currentUser?.nickName || "");
  const [phone, setPhone]       = useState(currentUser?.phone || "");
  const [preview, setPreview]   = useState(currentUser?.profileImage || "");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      setImageFile(compressed);
      setPreview(URL.createObjectURL(compressed));
    } catch {
      setError("Failed to process image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    setError("");

    try {
      // Step 1: Upload image if a new one was selected
      let profileImage = currentUser?.profileImage || "";
      if (imageFile) {
        const uploadResult = await uploadFile(imageFile);
        if (uploadResult?.url) {
          profileImage = uploadResult.url;
        } else {
          throw new Error("Image upload failed");
        }
      }

      // Step 2: Update user profile
      // updateUser(data) — NO userId arg, backend uses cookie to identify user
      // Send "name" (not fullName/nickName) — backend maps name → nickName automatically
      const payload = {
        name: name.trim(),
        profileImage,
      };
      if (phone.trim()) payload.phone = phone.trim();

      const result = await updateUser(payload);

      // Step 3: Update the AuthContext so the header/sidebar refresh
      if (result?.user) {
        updateCurrentUser(result.user);
      } else if (result) {
        // Some versions return user directly
        updateCurrentUser(result);
      }

      setSuccess(true);
      setTimeout(onClose, 900);
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: "#181830",
        border: "1px solid rgba(124,58,237,0.3)",
        borderRadius: 24, padding: "36px 32px",
        width: "100%", maxWidth: 400,
        boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 20, color: "#f0f0ff" }}>
            Edit Profile
          </h2>
          <button onClick={onClose} style={closeBtn}>
            <X size={18} />
          </button>
        </div>

        {/* Avatar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{ position: "relative" }}>
            {preview ? (
              <img src={preview} alt="Profile"
                style={{ width: 84, height: 84, borderRadius: "50%", objectFit: "cover", border: "3px solid #7c3aed", boxShadow: "0 0 24px rgba(124,58,237,0.45)" }}
              />
            ) : (
              <div style={{ width: 84, height: 84, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid rgba(124,58,237,0.5)", fontSize: 32, color: "white", fontWeight: 700 }}>
                {(currentUser?.name || currentUser?.nickName || "?")[0]?.toUpperCase()}
              </div>
            )}
            {uploading && (
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(7,7,26,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 22, height: 22, border: "2px solid rgba(167,139,250,0.3)", borderTop: "2px solid #a78bfa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              </div>
            )}
          </div>
          <button type="button" onClick={() => fileRef.current?.click()}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 16px", borderRadius: 9, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.22)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(124,58,237,0.12)"}
          >
            <Camera size={13} /> {uploading ? "Processing..." : "Change Photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#fb7185" }}>
            ⚠ {error}
          </div>
        )}
        {success && (
          <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#4ade80", display: "flex", alignItems: "center", gap: 8 }}>
            <Check size={14} /> Profile updated!
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Display Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "rgba(124,58,237,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)"; }}
              onBlur={e =>  { e.target.style.borderColor = "rgba(124,58,237,0.2)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div>
            <label style={labelStyle}>Phone (optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Your phone number"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "rgba(124,58,237,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)"; }}
              onBlur={e =>  { e.target.style.borderColor = "rgba(124,58,237,0.2)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || uploading}
            style={{
              padding: "13px", borderRadius: 12, border: "none", marginTop: 4,
              background: (loading || uploading) ? "rgba(124,58,237,0.2)" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
              color: "white", fontSize: 14, fontWeight: 600,
              cursor: (loading || uploading) ? "not-allowed" : "pointer",
              boxShadow: (loading || uploading) ? "none" : "0 4px 20px rgba(124,58,237,0.4)",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <>
                <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                Saving...
              </>
            ) : "Save Changes"}
          </button>
        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "rgba(167,139,250,0.6)", marginBottom: 7,
  textTransform: "uppercase", letterSpacing: "0.06em",
};
const inputStyle = {
  width: "100%", background: "#0e0e24",
  border: "1px solid rgba(124,58,237,0.2)",
  borderRadius: 11, padding: "11px 14px",
  fontSize: 14, color: "#f0f0ff", outline: "none",
  transition: "all 0.18s", boxSizing: "border-box",
  fontFamily: "'DM Sans', sans-serif",
};
const closeBtn = {
  background: "none", border: "none", cursor: "pointer",
  color: "rgba(167,139,250,0.5)", display: "flex",
  padding: 6, borderRadius: 8, transition: "color 0.15s",
};
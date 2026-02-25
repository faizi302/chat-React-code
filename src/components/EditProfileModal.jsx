// EditProfileModal.jsx
import React, { useState, useRef } from "react";
import { Camera, X, Check } from "lucide-react";
import { uploadFile, updateUser } from "../api/api";
import { useAuth } from "../context/AuthContext";

const compressImage = (file, maxWidth = 900, quality = 0.82) => new Promise(resolve => {
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => {
    let { width, height } = img;
    if (width > maxWidth) { height = Math.round(height * maxWidth / width); width = maxWidth; }
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    canvas.getContext("2d").drawImage(img, 0, 0, width, height);
    canvas.toBlob(blob => { URL.revokeObjectURL(url); resolve(new File([blob], "profile.jpg", { type: "image/jpeg" })); }, "image/jpeg", quality);
  };
  img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
  img.src = url;
});

export default function EditProfileModal({ onClose }) {
  const { currentUser, updateCurrentUser } = useAuth();
  const fileRef = useRef();
  const [name, setName]       = useState(currentUser?.name || currentUser?.nickName || "");
  const [phone, setPhone]     = useState(currentUser?.phone || "");
  const [preview, setPreview] = useState(currentUser?.profileImage || "");
  const [imgFile, setImgFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const handleImageChange = async e => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const c = await compressImage(file);
      setImgFile(c); setPreview(URL.createObjectURL(c));
    } catch { setError("Failed to process image"); }
    setUploading(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setLoading(true); setError("");
    try {
      let profileImage = currentUser?.profileImage || "";
      if (imgFile) {
        const res = await uploadFile(imgFile);
        if (res?.url) profileImage = res.url; else throw new Error("Image upload failed");
      }
      const payload = { name: name.trim(), profileImage };
      if (phone.trim()) payload.phone = phone.trim();
      const result = await updateUser(payload);
      updateCurrentUser(result?.user || result);
      setSuccess(true); setTimeout(onClose, 900);
    } catch (err) { setError(err.message || "Update failed"); }
    setLoading(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ padding: "36px 32px", width: "100%", maxWidth: 400 }}>
        <div className="modal-header">
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 20, color: "#f0f0ff" }}>Edit Profile</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{ position: "relative" }}>
            {preview
              ? <img src={preview} alt="Profile" style={{ width: 84, height: 84, borderRadius: "50%", objectFit: "cover", border: "3px solid #7c3aed", boxShadow: "0 0 24px rgba(124,58,237,0.45)" }} />
              : <div style={{ width: 84, height: 84, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid rgba(124,58,237,0.5)", fontSize: 32, color: "white", fontWeight: 700 }}>
                  {(currentUser?.name || currentUser?.nickName || "?")[0]?.toUpperCase()}
                </div>
            }
            {uploading && (
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(7,7,26,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="spinner" />
              </div>
            )}
          </div>
          <button type="button" className="btn-change-photo" onClick={() => fileRef.current?.click()}>
            <Camera size={13} /> {uploading ? "Processing..." : "Change Photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
        </div>

        {error && <div className="modal-error">⚠ {error}</div>}
        {success && <div className="modal-success"><Check size={14} /> Profile updated!</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="modal-label">Display Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="modal-input" />
          </div>
          <div>
            <label className="modal-label">Phone (optional)</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your phone number" className="modal-input" />
          </div>
          <button type="submit" className="btn-primary" disabled={loading || uploading}>
            {loading ? <><div className="spinner" /> Saving…</> : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
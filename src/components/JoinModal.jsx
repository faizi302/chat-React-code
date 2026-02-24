// JoinModal.jsx
import React, { useState } from "react";
import { Hash, X, Camera } from "lucide-react";
import { uploadFile } from "../api/api";

const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const ratio = img.width / img.height;
      canvas.width = maxWidth;
      canvas.height = maxWidth / ratio;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        resolve(new File([blob], file.name, { type: file.type }));
      }, file.type, quality);
    };
    img.onerror = reject;
  });
};

const modalStyle = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000,
};

const boxStyle = {
  background: "#181830",
  border: "1px solid rgba(124,58,237,0.3)",
  borderRadius: 24, padding: 32,
  width: 400, maxWidth: "90vw",
  boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 50px rgba(124,58,237,0.08)",
};

export default function JoinModal({ onJoin, close }) {
  const [roomName, setRoomName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = React.useRef();

  const handleImageChange = async e => {
    let file = e.target.files[0];
    if (!file) return;
    try { file = await compressImage(file); } catch (err) { console.error("Compression failed:", err); }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!roomName.trim()) return;
    setUploading(true);
    let imageUrl = "";
    if (imageFile) {
      try {
        const result = await uploadFile(imageFile);
        if (result?.url) imageUrl = result.url;
        else throw new Error("Upload failed");
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Failed to upload group image. Creating without image.");
      }
    }
    onJoin(roomName, imageUrl);
    setUploading(false);
    close();
  };

  const inputStyle = {
    width: "100%",
    background: "#0e0e24",
    border: "1px solid rgba(124,58,237,0.25)",
    borderRadius: 12, padding: "13px 18px",
    fontSize: 15, color: "#f0f0ff", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div className="modal-overlay" style={modalStyle}>
      <div className="modal-box" style={boxStyle}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#f0f0ff" }}>
            <Hash size={20} color="#a78bfa" /> Join or Create Group
          </div>
          <button
            onClick={close}
            style={{ background: "none", border: "none", color: "rgba(167,139,250,0.5)", cursor: "pointer", padding: 6, borderRadius: 8, transition: "color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f0f0ff"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(167,139,250,0.5)"; }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Group image */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 24 }}>
          {preview ? (
            <img src={preview} alt="Preview" style={{ width: 86, height: 86, borderRadius: "50%", objectFit: "cover", border: "3px solid #7c3aed", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }} />
          ) : (
            <div style={{ width: 86, height: 86, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid rgba(124,58,237,0.4)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
              <Hash size={36} color="white" />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current.click()}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 10, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.22)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(124,58,237,0.12)"; }}
          >
            <Camera size={14} /> Group Photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="file-input" onChange={handleImageChange} />
        </div>

        {/* Room name */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, color: "rgba(167,139,250,0.6)", fontWeight: 600, marginBottom: 10, letterSpacing: "0.05em" }}>
            GROUP NAME
          </label>
          <input
            autoFocus
            type="text"
            placeholder="e.g. Study Group, Friends..."
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = "rgba(124,58,237,0.6)"; e.target.style.boxShadow = "0 0 0 4px rgba(124,58,237,0.12)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(124,58,237,0.25)"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={close}
            style={{ flex: 1, padding: "13px 0", borderRadius: 12, fontSize: 15, fontWeight: 600, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!roomName.trim() || uploading}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 0", borderRadius: 12, fontSize: 15, fontWeight: 600, border: "none", background: roomName.trim() && !uploading ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(124,58,237,0.2)", color: "white", cursor: roomName.trim() && !uploading ? "pointer" : "default", boxShadow: roomName.trim() && !uploading ? "0 4px 20px rgba(124,58,237,0.45)" : "none", transition: "all 0.2s" }}
            onMouseEnter={e => { if (roomName.trim() && !uploading) e.currentTarget.style.boxShadow = "0 6px 28px rgba(124,58,237,0.6)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = roomName.trim() && !uploading ? "0 4px 20px rgba(124,58,237,0.45)" : "none"; }}
          >
            {uploading ? <><span className="spinner" /> Creating…</> : "Join / Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
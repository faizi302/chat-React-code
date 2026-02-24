// NicknameModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { Camera, ArrowRight, Zap } from "lucide-react";
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

export default function NicknameModal({ onSave, isEdit = false, initialName = "", initialImage = "" }) {
  const [name, setName]         = useState(initialName);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]   = useState(initialImage);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();
  const fileRef  = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleImageChange = async e => {
    let file = e.target.files[0];
    if (!file) return;
    try {
      if (file.type.startsWith("image/")) file = await compressImage(file);
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    } catch (err) {
      console.error("Image handling error:", err);
      alert("Failed to process image.");
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!name.trim()) return;
    setUploading(true);
    let imageUrl = initialImage || "";
    if (imageFile) {
      try {
        const result = await uploadFile(imageFile);
        if (result) imageUrl = result.url;
        else throw new Error("Upload failed");
      } catch (err) {
        console.error("Upload error:", err);
        alert("Failed to upload profile image. Proceeding without image.");
      }
    }
    onSave(name, imageUrl);
    setUploading(false);
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="modal-box"
        style={{
          background: "#181830",
          border: "1px solid rgba(124,58,237,0.3)",
          borderRadius: 24, padding: 36,
          width: 380, maxWidth: "90vw",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 50px rgba(124,58,237,0.1)",
          textAlign: "center",
        }}
      >
        {/* Avatar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 28 }}>
          {preview ? (
            <img
              src={preview} alt="Profile"
              style={{
                width: 90, height: 90, borderRadius: "50%", objectFit: "cover",
                border: "3px solid #7c3aed",
                boxShadow: "0 0 24px rgba(124,58,237,0.45)",
              }}
            />
          ) : (
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "3px solid rgba(124,58,237,0.5)",
              boxShadow: "0 0 24px rgba(124,58,237,0.4)",
            }}>
              <Zap size={36} color="white" />
            </div>
          )}

          <button
            type="button"
            onClick={() => fileRef.current.click()}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 18px", borderRadius: 10,
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.25)",
              color: "#a78bfa", fontSize: 13, fontWeight: 500,
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.22)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(124,58,237,0.12)"; }}
          >
            <Camera size={14} />
            {isEdit ? "Change Photo" : "Upload Photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="file-input" onChange={handleImageChange} />
        </div>

        <h2 style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22,
          color: "#f0f0ff", marginBottom: 24,
        }}>
          {isEdit ? "Edit Profile" : "Welcome — Set Your Nickname"}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="e.g. Alex"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: "100%",
              background: "#0e0e24",
              border: "1px solid rgba(124,58,237,0.25)",
              borderRadius: 12, padding: "13px 18px",
              fontSize: 15, color: "#f0f0ff", outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={e => { e.target.style.borderColor = "rgba(124,58,237,0.6)"; e.target.style.boxShadow = "0 0 0 4px rgba(124,58,237,0.12)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(124,58,237,0.25)"; e.target.style.boxShadow = "none"; }}
          />

          <button
            type="submit"
            disabled={!name.trim() || uploading}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "14px 24px", borderRadius: 12, border: "none",
              background: name.trim() && !uploading
                ? "linear-gradient(135deg,#7c3aed,#4f46e5)"
                : "rgba(124,58,237,0.2)",
              color: "white", fontSize: 15, fontWeight: 600,
              cursor: name.trim() && !uploading ? "pointer" : "default",
              boxShadow: name.trim() && !uploading ? "0 4px 20px rgba(124,58,237,0.5)" : "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { if (name.trim() && !uploading) { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(124,58,237,0.65)"; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = name.trim() && !uploading ? "0 4px 20px rgba(124,58,237,0.5)" : "none"; }}
          >
            {uploading ? (
              <><span className="spinner" /> Uploading…</>
            ) : (
              <>{isEdit ? "Save Changes" : "Let's Go"} <ArrowRight size={16} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
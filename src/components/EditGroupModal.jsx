// src/components/EditGroupModal.jsx
import React, { useState, useRef } from "react";
import { Hash, X, Camera } from "lucide-react";
import { uploadFile } from "../api/api";

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
          resolve(new File([blob], "group.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });

export default function EditGroupModal({ room, onUpdate, close }) {
  const [name, setName]           = useState(room.name || "");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState(room.profileImage || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");
  const fileRef = useRef();

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      setImageFile(compressed);
      setPreview(URL.createObjectURL(compressed));
    } catch (err) {
      setError("Failed to process image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Group name is required"); return; }
    setUploading(true);
    setError("");

    let imageUrl = room.profileImage || "";

    // Upload new image if one was selected
    if (imageFile) {
      try {
        const result = await uploadFile(imageFile);
        if (result?.url) {
          imageUrl = result.url;
        } else {
          throw new Error("No URL returned from upload");
        }
      } catch (err) {
        console.error("Image upload failed:", err);
        setError("Image upload failed — saving with old photo.");
        // Don't block saving, just keep old image
      }
    }

    onUpdate(room._id, name.trim(), imageUrl);
    setUploading(false);
    close();
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: "#181830",
        border: "1px solid rgba(124,58,237,0.3)",
        borderRadius: 24, padding: "32px 28px",
        width: "100%", maxWidth: 400,
        boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 20, color: "#f0f0ff" }}>
            <Hash size={20} color="#a78bfa" /> Edit Group
          </div>
          <button onClick={close} style={{ background: "none", border: "none", color: "rgba(167,139,250,0.5)", cursor: "pointer", padding: 6, borderRadius: 8 }}>
            <X size={20} />
          </button>
        </div>

        {/* Group image */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ position: "relative" }}>
            {preview ? (
              <img src={preview} alt="Group"
                style={{ width: 86, height: 86, borderRadius: "50%", objectFit: "cover", border: "3px solid #7c3aed", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}
              />
            ) : (
              <div style={{ width: 86, height: 86, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid rgba(124,58,237,0.4)" }}>
                <Hash size={34} color="white" />
              </div>
            )}
            {uploading && (
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(7,7,26,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 22, height: 22, border: "2px solid rgba(167,139,250,0.3)", borderTop: "2px solid #a78bfa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 9, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.22)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(124,58,237,0.12)"}
          >
            <Camera size={13} /> {uploading ? "Uploading..." : "Change Photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#fb7185" }}>
            ⚠ {error}
          </div>
        )}

        {/* Group name */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(167,139,250,0.6)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Group Name
          </label>
          <input
            autoFocus
            type="text"
            placeholder="Group name..."
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !uploading && handleSubmit()}
            style={{
              width: "100%", background: "#0e0e24",
              border: "1px solid rgba(124,58,237,0.25)",
              borderRadius: 11, padding: "12px 16px",
              fontSize: 14, color: "#f0f0ff", outline: "none",
              transition: "all 0.18s", boxSizing: "border-box",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onFocus={e => { e.target.style.borderColor = "rgba(124,58,237,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)"; }}
            onBlur={e =>  { e.target.style.borderColor = "rgba(124,58,237,0.25)"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={close}
            style={{ flex: 1, padding: "12px 0", borderRadius: 11, fontSize: 14, fontWeight: 600, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.12)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 11, fontSize: 14, fontWeight: 600,
              border: "none", cursor: uploading ? "not-allowed" : "pointer",
              background: uploading ? "rgba(124,58,237,0.2)" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
              color: "white",
              boxShadow: uploading ? "none" : "0 4px 20px rgba(124,58,237,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {uploading ? (
              <>
                <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                Saving...
              </>
            ) : "Save Changes"}
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
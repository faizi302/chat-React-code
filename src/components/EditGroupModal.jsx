import React, { useState, useRef } from "react";
import { Hash, X, Camera } from "lucide-react";
import { uploadFile } from "../api/api";

const compressImage = (file, maxWidth = 900, quality = 0.82) => new Promise(resolve => {
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => {
    let { width, height } = img;
    if (width > maxWidth) { height = Math.round(height * maxWidth / width); width = maxWidth; }
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    canvas.getContext("2d").drawImage(img, 0, 0, width, height);
    canvas.toBlob(blob => { URL.revokeObjectURL(url); resolve(new File([blob], "group.jpg", { type: "image/jpeg" })); }, "image/jpeg", quality);
  };
  img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
  img.src = url;
});

export default function EditGroupModal({ room, onUpdate, close }) {
  const [name, setName]       = useState(room.name || "");
  const [imgFile, setImgFile] = useState(null);
  const [preview, setPreview] = useState(room.profileImage || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError]     = useState("");
  const fileRef = useRef();

  const handleImageChange = async e => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const c = await compressImage(file); setImgFile(c); setPreview(URL.createObjectURL(c)); }
    catch { setError("Failed to process image"); }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Group name is required"); return; }
    setUploading(true); setError("");
    let imageUrl = room.profileImage || "";
    if (imgFile) {
      try { const res = await uploadFile(imgFile); if (res?.url) imageUrl = res.url; }
      catch (err) { setError("Image upload failed — saving with old photo."); }
    }
    onUpdate(room._id, name.trim(), imageUrl);
    setUploading(false); close();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ padding: "32px 28px", width: "100%", maxWidth: 400 }}>
        <div className="modal-header">
          <div className="modal-title"><Hash size={20} color="#a78bfa" /> Edit Group</div>
          <button className="modal-close" onClick={close}><X size={20} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ position: "relative" }}>
            {preview
              ? <img src={preview} alt="Group" style={{ width: 86, height: 86, borderRadius: "50%", objectFit: "cover", border: "3px solid #7c3aed", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }} />
              : <div style={{ width: 86, height: 86, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid rgba(124,58,237,0.4)" }}>
                  <Hash size={34} color="white" />
                </div>
            }
            {uploading && <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(7,7,26,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spinner" /></div>}
          </div>
          <button type="button" className="btn-change-photo" onClick={() => fileRef.current?.click()}>
            <Camera size={13} /> {uploading ? "Uploading..." : "Change Photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
        </div>

        {error && <div className="modal-error">⚠ {error}</div>}

        <div style={{ marginBottom: 24 }}>
          <label className="modal-label">Group Name</label>
          <input autoFocus type="text" placeholder="Group name..." value={name}
            onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && !uploading && handleSubmit()}
            className="modal-input" />
        </div>

        <div className="btn-row">
          <button className="btn-secondary" onClick={close}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={uploading}>
            {uploading ? <><div className="spinner" /> Saving…</> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
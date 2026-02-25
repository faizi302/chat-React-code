import React, { useState, useRef } from "react";
import { Hash, X, Camera } from "lucide-react";
import { uploadFile } from "../api/api";

const compressImage = (file) => new Promise((resolve, reject) => {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ratio = img.height / img.width;
    canvas.width = 800; canvas.height = 800 * ratio;
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => resolve(new File([blob], file.name, { type: file.type })), file.type, 0.7);
  };
  img.onerror = reject;
});

export default function JoinModal({ onJoin, close }) {
  const [roomName, setRoomName] = useState("");
  const [imgFile, setImgFile]   = useState(null);
  const [preview, setPreview]   = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleImageChange = async e => {
    let file = e.target.files[0]; if (!file) return;
    try { file = await compressImage(file); } catch {}
    setImgFile(file); setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!roomName.trim()) return;
    setUploading(true);
    let imageUrl = "";
    if (imgFile) {
      try { const res = await uploadFile(imgFile); if (res?.url) imageUrl = res.url; }
      catch { alert("Failed to upload image. Creating without image."); }
    }
    onJoin(roomName, imageUrl);
    setUploading(false); close();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ padding: 32, width: 400, maxWidth: "90vw" }}>
        <div className="modal-header">
          <div className="modal-title"><Hash size={20} color="#a78bfa" /> Join or Create Group</div>
          <button className="modal-close" onClick={close}><X size={22} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 24 }}>
          {preview
            ? <img src={preview} alt="Preview" style={{ width: 86, height: 86, borderRadius: "50%", objectFit: "cover", border: "3px solid #7c3aed", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }} />
            : <div style={{ width: 86, height: 86, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid rgba(124,58,237,0.4)" }}>
                <Hash size={36} color="white" />
              </div>
          }
          <button type="button" className="btn-change-photo" onClick={() => fileRef.current.click()}>
            <Camera size={14} /> Group Photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label className="modal-label">Group Name</label>
          <input autoFocus type="text" placeholder="e.g. Study Group, Friends..." value={roomName}
            onChange={e => setRoomName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
            className="modal-input" />
        </div>

        <div className="btn-row">
          <button className="btn-secondary" onClick={close}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={!roomName.trim() || uploading}>
            {uploading ? <><div className="spinner" /> Creating…</> : "Join / Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
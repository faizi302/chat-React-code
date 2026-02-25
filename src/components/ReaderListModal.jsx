import React from "react";
import { Eye, X } from "lucide-react";

export default function ReaderListModal({ readers, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ padding: 32, width: 380, maxWidth: "90vw" }}>
        <div className="modal-header">
          <div className="modal-title"><Eye size={20} color="#67e8f9" /> Seen By</div>
          <button className="modal-close" onClick={onClose}><X size={22} /></button>
        </div>

        <div style={{ maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          {readers.length === 0 ? (
            <div style={{ textAlign: "center", fontSize: 15, color: "rgba(167,139,250,0.4)", fontStyle: "italic", padding: "24px 0" }}>
              No one has seen this yet.
            </div>
          ) : readers.map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(124,58,237,0.08)", background: "rgba(255,255,255,0.03)" }}>
              {r.profileImage
                ? <img src={r.profileImage} alt={r.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(124,58,237,0.35)", flexShrink: 0 }} />
                : <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 17, color: "white", border: "2px solid rgba(124,58,237,0.35)", flexShrink: 0 }}>
                    {r.name?.[0]?.toUpperCase() || "?"}
                  </div>
              }
              <span style={{ flex: 1, fontSize: 15, color: "#f0f0ff", fontWeight: 500 }}>{r.name}</span>
              <Eye size={16} color="rgba(103,232,249,0.55)" style={{ flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// ReaderListModal.jsx
import React from "react";
import { Eye, X } from "lucide-react";

export default function ReaderListModal({ readers, onClose }) {
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
          borderRadius: 24, padding: 32,
          width: 380, maxWidth: "90vw",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#f0f0ff" }}>
            <Eye size={20} color="#67e8f9" /> Seen By
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(167,139,250,0.5)", cursor: "pointer", padding: 6, borderRadius: 8, transition: "color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f0f0ff"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(167,139,250,0.5)"; }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Readers list */}
        <div style={{ maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          {readers.length === 0 ? (
            <div style={{ textAlign: "center", fontSize: 15, color: "rgba(167,139,250,0.4)", fontStyle: "italic", padding: "24px 0" }}>
              No one has seen this yet.
            </div>
          ) : (
            readers.map(reader => (
              <div
                key={reader.id}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 14px", borderRadius: 14,
                  border: "1px solid rgba(124,58,237,0.08)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                {reader.profileImage ? (
                  <img
                    src={reader.profileImage}
                    alt={reader.name}
                    style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(124,58,237,0.35)", flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17, color: "white",
                    border: "2px solid rgba(124,58,237,0.35)", flexShrink: 0,
                  }}>
                    {reader.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <span style={{ flex: 1, fontSize: 15, color: "#f0f0ff", fontWeight: 500 }}>
                  {reader.name}
                </span>
                <Eye size={16} color="rgba(103,232,249,0.55)" style={{ flexShrink: 0 }} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
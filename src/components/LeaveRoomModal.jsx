// LeaveRoomModal.jsx
import React from "react";
import { AlertTriangle } from "lucide-react";

export default function LeaveRoomModal({ onConfirm, close }) {
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
          border: "1px solid rgba(244,63,94,0.3)",
          borderRadius: 24, padding: 36,
          width: 380, maxWidth: "90vw",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 40px rgba(244,63,94,0.08)",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(244,63,94,0.12)",
          border: "2px solid rgba(244,63,94,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
          boxShadow: "0 0 24px rgba(244,63,94,0.2)",
        }}>
          <AlertTriangle size={32} color="#fb7185" />
        </div>

        <h2 style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22,
          color: "#f0f0ff", marginBottom: 12,
        }}>
          Leave Group?
        </h2>

        <p style={{
          fontSize: 15, color: "rgba(167,139,250,0.55)",
          marginBottom: 32, lineHeight: 1.7,
        }}>
          You won't receive any more messages from this group.
          You can always rejoin later.
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={close}
            style={{
              flex: 1, padding: "13px 0", borderRadius: 12,
              fontSize: 15, fontWeight: 600,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(124,58,237,0.2)",
              color: "#a78bfa", cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "13px 0", borderRadius: 12,
              fontSize: 15, fontWeight: 600, border: "none",
              background: "linear-gradient(135deg,#e11d48,#f43f5e)",
              color: "white", cursor: "pointer",
              boxShadow: "0 4px 20px rgba(225,29,72,0.45)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 28px rgba(225,29,72,0.65)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(225,29,72,0.45)"; }}
          >
            Leave Group
          </button>
        </div>
      </div>
    </div>
  );
}
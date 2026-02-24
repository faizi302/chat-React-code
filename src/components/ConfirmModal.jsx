// src/components/ConfirmModal.jsx
import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({ title, message, confirmLabel = "Confirm", danger = false, onConfirm, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1100, padding: 16,
    }}>
      <div style={{
        background: "#181830",
        border: `1px solid ${danger ? "rgba(244,63,94,0.3)" : "rgba(124,58,237,0.3)"}`,
        borderRadius: 24, padding: "36px 32px",
        width: "100%", maxWidth: 380, textAlign: "center",
        boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 40px ${danger ? "rgba(244,63,94,0.08)" : "rgba(124,58,237,0.08)"}`,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          width: 68, height: 68, borderRadius: "50%",
          background: danger ? "rgba(244,63,94,0.12)" : "rgba(124,58,237,0.12)",
          border: `2px solid ${danger ? "rgba(244,63,94,0.3)" : "rgba(124,58,237,0.3)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: `0 0 24px ${danger ? "rgba(244,63,94,0.2)" : "rgba(124,58,237,0.2)"}`,
        }}>
          <AlertTriangle size={28} color={danger ? "#fb7185" : "#a78bfa"} />
        </div>

        <h2 style={{ fontWeight: 700, fontSize: 20, color: "#f0f0ff", marginBottom: 12 }}>
          {title}
        </h2>
        <p style={{ fontSize: 14, color: "rgba(167,139,250,0.55)", marginBottom: 28, lineHeight: 1.7 }}>
          {message}
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 12, fontSize: 14, fontWeight: 600,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(124,58,237,0.2)",
              color: "#a78bfa", cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 12, fontSize: 14, fontWeight: 700,
              border: "none", cursor: "pointer",
              background: danger
                ? "linear-gradient(135deg,#e11d48,#f43f5e)"
                : "linear-gradient(135deg,#7c3aed,#4f46e5)",
              color: "white",
              boxShadow: `0 4px 20px ${danger ? "rgba(225,29,72,0.4)" : "rgba(124,58,237,0.4)"}`,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
// LeaveRoomModal.jsx
import React from "react";
import { AlertTriangle } from "lucide-react";

export function LeaveRoomModal({ onConfirm, close }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ padding: 36, width: 380, maxWidth: "90vw", textAlign: "center", borderColor: "rgba(244,63,94,0.3)", boxShadow: "0 24px 80px rgba(0,0,0,0.7),0 0 40px rgba(244,63,94,0.08)" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(244,63,94,0.12)", border: "2px solid rgba(244,63,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 24px rgba(244,63,94,0.2)" }}>
          <AlertTriangle size={32} color="#fb7185" />
        </div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: "#f0f0ff", marginBottom: 12 }}>Leave Group?</h2>
        <p style={{ fontSize: 15, color: "rgba(167,139,250,0.55)", marginBottom: 32, lineHeight: 1.7 }}>
          You won't receive any more messages from this group. You can always rejoin later.
        </p>
        <div className="btn-row">
          <button className="btn-secondary" onClick={close}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Leave Group</button>
        </div>
      </div>
    </div>
  );
}

export default LeaveRoomModal;
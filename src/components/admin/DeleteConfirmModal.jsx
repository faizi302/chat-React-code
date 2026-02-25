// src/components/admin/DeleteConfirmModal.jsx

export default function DeleteConfirmModal({ isLoading, onConfirm, onCancel }) {
  const secondaryBtn = {
    flex: 1, padding: "9px 16px", borderRadius: 10,
    border: "1px solid rgba(124,58,237,0.3)",
    background: "rgba(124,58,237,0.1)", color: "#a78bfa",
    cursor: "pointer", fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans',sans-serif",
  };
  const dangerBtn = {
    flex: 1, padding: "9px 20px", borderRadius: 10,
    border: "1px solid rgba(244,63,94,0.3)",
    background: "rgba(244,63,94,0.15)", color: "#fb7185",
    cursor: isLoading ? "not-allowed" : "pointer",
    fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans',sans-serif",
  };

  return (
    // Backdrop
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Card */}
      <div
        style={{
          background: "#181830",
          border: "1px solid rgba(244,63,94,0.3)",
          borderRadius: 20,
          padding: "32px 28px",
          maxWidth: 360, width: "100%",
          textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: "#f0f0ff", marginBottom: 12 }}>
          Delete User?
        </div>
        <p style={{ color: "rgba(167,139,250,0.5)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          This permanently deletes the user and all their data.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={secondaryBtn}>Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} style={dangerBtn}>
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
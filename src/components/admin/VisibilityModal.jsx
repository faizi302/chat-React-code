// src/components/admin/VisibilityModal.jsx
import { useState, useEffect } from "react";
import { getVisibleUsers, setVisibleUsers } from "../../api/api.js";
import AdminAvatar from "./AdminAvatar.jsx";

export default function VisibilityModal({ targetUser, allUsers, currentAdminId, onClose, onSave }) {
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState("");

  // Load existing visibility settings on open
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getVisibleUsers(targetUser._id);
        setSelected(new Set(data.visibleUserIds || []));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [targetUser._id]);

  // Toggle one user in/out of selected set
  const toggleOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Toggle all eligible users at once
  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allChecked) eligibleUsers.forEach(u => next.delete(u._id));
      else            eligibleUsers.forEach(u => next.add(u._id));
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setVisibleUsers(targetUser._id, [...selected]);
      onSave(targetUser._id, [...selected]);
      onClose();
    } catch (e) { alert("Failed to save: " + e.message); }
    finally { setSaving(false); }
  };

  // Users that can appear in the list (exclude self, current admin, other admins)
  const eligibleUsers = allUsers.filter(u =>
    u._id !== targetUser._id &&
    u._id !== currentAdminId &&
    u.role !== "admin" &&
    (
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const allChecked = eligibleUsers.length > 0 && eligibleUsers.every(u => selected.has(u._id));

  return (
    // Backdrop
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(10px)",
        zIndex: 2000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Modal box */}
      <div
        style={{
          background: "#12122a",
          border: "1px solid rgba(124,58,237,0.3)",
          borderRadius: 24,
          width: "100%", maxWidth: 520, maxHeight: "85vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ── Header ── */}
        <div style={{ padding: "24px 28px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <AdminAvatar src={targetUser.profileImage} name={targetUser.name} size={42} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#f0f0ff" }}>Sidebar Visibility</div>
                <div style={{ fontSize: 12, color: "rgba(167,139,250,0.5)", marginTop: 2 }}>
                  Who can <strong style={{ color: "#a78bfa" }}>{targetUser.nickName || targetUser.name}</strong> see?
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(167,139,250,0.5)", fontSize: 22 }}>×</button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px",
              border: "1px solid rgba(124,58,237,0.2)",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 10, color: "#f0f0ff", fontSize: 13,
              outline: "none", boxSizing: "border-box",
              margin: "16px 0 0",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />

          {/* Select all row */}
          {!loading && eligibleUsers.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "rgba(167,139,250,0.7)", userSelect: "none" }}>
                <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ width: 16, height: 16, accentColor: "#7c3aed" }} />
                Select all ({eligibleUsers.length})
              </label>
              <span style={{ fontSize: 12, color: "rgba(167,139,250,0.4)" }}>{selected.size} selected</span>
            </div>
          )}
          <div style={{ height: 1, background: "rgba(124,58,237,0.15)" }} />
        </div>

        {/* ── User list ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 28px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "rgba(167,139,250,0.4)" }}>Loading...</div>
          ) : eligibleUsers.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "rgba(167,139,250,0.3)", fontSize: 13 }}>
              {search ? "No matches" : "No other users"}
            </div>
          ) : eligibleUsers.map(u => {
            const isChecked = selected.has(u._id);
            return (
              <label
                key={u._id}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "11px 12px", borderRadius: 12,
                  cursor: "pointer", margin: "2px 0", userSelect: "none",
                  background: isChecked ? "rgba(124,58,237,0.12)" : "transparent",
                  border: isChecked ? "1px solid rgba(124,58,237,0.25)" : "1px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleOne(u._id)}
                  style={{ width: 17, height: 17, accentColor: "#7c3aed", cursor: "pointer", flexShrink: 0 }}
                />
                <AdminAvatar src={u.profileImage} name={u.name} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#f0f0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {u.nickName || u.name}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(167,139,250,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {u.email}
                  </div>
                </div>
                {isChecked && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", background: "rgba(74,222,128,0.1)", padding: "2px 8px", borderRadius: 99, flexShrink: 0 }}>
                    Allowed
                  </span>
                )}
              </label>
            );
          })}
        </div>

        {/* ── Footer buttons ── */}
        <div style={{ padding: "16px 28px 24px", borderTop: "1px solid rgba(124,58,237,0.15)", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{ flex: 1, padding: "12px", borderRadius: 11, border: "1px solid rgba(124,58,237,0.25)", background: "rgba(124,58,237,0.08)", color: "#a78bfa", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 2, padding: "12px", borderRadius: 11, border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                background: saving ? "rgba(124,58,237,0.25)" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                color: "white", fontSize: 14, fontWeight: 700,
              }}
            >
              {saving ? "Saving..." : `✓ Save Permissions (${selected.size} users)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
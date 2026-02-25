// src/components/admin/GroupDetailModal.jsx
import { useState } from "react";
import { promoteToGroupAdmin, demoteGroupAdmin, removeGroupMember } from "../../api/api.js";
import AdminAvatar from "./AdminAvatar.jsx";

export default function GroupDetailModal({ room, onClose, onRoomUpdated, onDeleteRoom, onClearChat }) {
  const [actionLoading, setActionLoading] = useState(null);

  // Derive role info from room data
  const mainAdminId   = (room.mainAdmin?._id || room.mainAdmin)?.toString();
  const groupAdminIds = (room.groupAdmins || []).map(a => (a._id || a).toString());

  const getRoleInfo = (userId) => {
    const id = userId.toString();
    if (id === mainAdminId)         return { label: "Main Admin", color: "#f9a8d4", bg: "rgba(236,72,153,0.15)" };
    if (groupAdminIds.includes(id)) return { label: "Admin",      color: "#a78bfa", bg: "rgba(124,58,237,0.15)" };
    return                                 { label: "Member",      color: "rgba(167,139,250,0.4)", bg: "transparent" };
  };

  // Generic action runner — sets loading key, calls api fn, updates parent
  const runAction = async (loadingKey, apiFn) => {
    setActionLoading(loadingKey);
    try {
      const updatedRoom = await apiFn();
      onRoomUpdated(updatedRoom);
    } catch (e) { alert(e.message); }
    setActionLoading(null);
  };

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
          width: "100%", maxWidth: 560, maxHeight: "88vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ── Header ── */}
        <div style={{ padding: "24px 28px 16px", borderBottom: "1px solid rgba(124,58,237,0.1)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <AdminAvatar src={room.profileImage} name={room.name} size={48} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, color: "#f0f0ff" }}>{room.name}</div>
                <div style={{ fontSize: 12, color: "rgba(167,139,250,0.4)", marginTop: 2 }}>
                  {room.members?.length || 0} members · Group
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(167,139,250,0.5)", fontSize: 22 }}>×</button>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <button
              onClick={onClearChat}
              style={{ padding: "7px 14px", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", background: "rgba(251,113,133,0.1)", color: "#fb7185", border: "1px solid rgba(251,113,133,0.2)" }}
            >
              🗑 Clear Chat
            </button>
            <button
              onClick={onDeleteRoom}
              style={{ padding: "7px 14px", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              🗑 Delete Group
            </button>
            {room.onlyAdminCanSend && (
              <span style={{ padding: "7px 12px", borderRadius: 9, fontSize: 11, fontWeight: 700, background: "rgba(251,113,133,0.1)", color: "#fb7185", border: "1px solid rgba(251,113,133,0.2)" }}>
                🔒 Admin-Only Send
              </span>
            )}
          </div>
        </div>

        {/* ── Members list ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 28px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(167,139,250,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Members
          </div>

          {(room.members || []).map(member => {
            const memberId   = (member._id || member).toString();
            const user       = member._id ? member : { name: "Unknown", profileImage: "" };
            const role       = getRoleInfo(memberId);
            const isMain     = memberId === mainAdminId;
            const isSubAdmin = groupAdminIds.includes(memberId);

            return (
              <div
                key={memberId}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 11, marginBottom: 2, border: "1px solid transparent", transition: "all 0.12s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.06)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
              >
                <AdminAvatar src={user.profileImage} name={user.nickName || user.name} size={36} />

                {/* Name + role badge */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.nickName || user.name || "Unknown"}
                  </div>
                  <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99, background: role.bg, color: role.color, fontWeight: 700 }}>
                    {role.label}
                  </span>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 4 }}>
                  {/* Promote — only visible for plain members */}
                  {!isMain && !isSubAdmin && (
                    <button
                      disabled={actionLoading === memberId + "_promote"}
                      onClick={() => runAction(memberId + "_promote", () => promoteToGroupAdmin(room._id, memberId))}
                      style={{ padding: "4px 9px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}
                    >
                      {actionLoading === memberId + "_promote" ? "..." : "↑ Promote"}
                    </button>
                  )}

                  {/* Demote — only visible for sub-admins (not main admin) */}
                  {isSubAdmin && !isMain && (
                    <button
                      disabled={actionLoading === memberId + "_demote"}
                      onClick={() => runAction(memberId + "_demote", () => demoteGroupAdmin(room._id, memberId))}
                      style={{ padding: "4px 9px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(249,115,22,0.1)", color: "#f97316", border: "1px solid rgba(249,115,22,0.2)" }}
                    >
                      {actionLoading === memberId + "_demote" ? "..." : "↓ Demote"}
                    </button>
                  )}

                  {/* Remove — always shown */}
                  <button
                    disabled={actionLoading === memberId + "_remove"}
                    onClick={() => {
                      if (!window.confirm("Remove this member?")) return;
                      runAction(memberId + "_remove", () => removeGroupMember(room._id, memberId));
                    }}
                    style={{ padding: "4px 9px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(244,63,94,0.1)", color: "#fb7185", border: "1px solid rgba(244,63,94,0.15)" }}
                  >
                    {actionLoading === memberId + "_remove" ? "..." : "✕ Remove"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
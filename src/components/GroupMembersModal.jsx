// GroupMembersModal.jsx
import React, { useState } from "react";
import { Users, X, Crown, Shield, UserMinus, ChevronDown, UserPlus } from "lucide-react";
import {
  promoteToGroupAdmin, demoteGroupAdmin, removeGroupMember, addGroupMember,
} from "../api/api";

export default function GroupMembersModal({
  room,
  usersMap,
  currentUser,
  allUsers,
  onClose,
  onUserClick,
  onRoomUpdated,
}) {
  const [actionLoading, setActionLoading] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [search, setSearch] = useState("");
  const [addSearch, setAddSearch] = useState("");

  const members = room?.members || [];
  const mainAdminId = (room?.mainAdmin?._id || room?.mainAdmin)?.toString();
  const groupAdminIds = (room?.groupAdmins || []).map(a => (a._id || a).toString());
  const currentUserId = currentUser?._id?.toString();
  const isAppAdmin = currentUser?.role === "admin";
  const isMainAdmin = mainAdminId === currentUserId;
  const isCurrentUserGroupAdmin = isMainAdmin || groupAdminIds.includes(currentUserId);
  const canManage = isAppAdmin || isCurrentUserGroupAdmin;
  const canPromote = isAppAdmin || isMainAdmin;

  const getRoleLabel = (memberId) => {
    const id = memberId.toString();
    if (id === mainAdminId) return { label: "Main Admin", icon: <Crown size={11} />, color: "#f9a8d4", bg: "rgba(236,72,153,0.15)", border: "rgba(236,72,153,0.3)" };
    if (groupAdminIds.includes(id)) return { label: "Admin", icon: <Shield size={11} />, color: "#a78bfa", bg: "rgba(124,58,237,0.15)", border: "rgba(124,58,237,0.3)" };
    return { label: "Member", icon: null, color: "rgba(167,139,250,0.4)", bg: "transparent", border: "transparent" };
  };

  const handlePromote = async (userId) => {
    setActionLoading(userId + "_promote");
    try {
      const updated = await promoteToGroupAdmin(room._id, userId);
      onRoomUpdated(updated);
    } catch (e) { alert(e.message); }
    setActionLoading(null);
  };

  const handleDemote = async (userId) => {
    setActionLoading(userId + "_demote");
    try {
      const updated = await demoteGroupAdmin(room._id, userId);
      onRoomUpdated(updated);
    } catch (e) { alert(e.message); }
    setActionLoading(null);
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Remove this member from the group?")) return;
    setActionLoading(userId + "_remove");
    try {
      const updated = await removeGroupMember(room._id, userId);
      onRoomUpdated(updated);
    } catch (e) { alert(e.message); }
    setActionLoading(null);
  };

  const handleAddMember = async (userId) => {
    setActionLoading(userId + "_add");
    try {
      const updated = await addGroupMember(room._id, userId);
      onRoomUpdated(updated);
    } catch (e) { alert(e.message); }
    setActionLoading(null);
  };

  const filteredMembers = members.filter(m => {
    const id = (m._id || m).toString();
    const user = usersMap[id] || m;
    const name = user.nickName || user.name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const memberIds = members.map(m => (m._id || m).toString());
  const nonMembers = (allUsers || []).filter(u =>
    !memberIds.includes(u._id?.toString()) &&
    (u.nickName || u.name || "").toLowerCase().includes(addSearch.toLowerCase())
  );

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: "#12122a",
        border: "1px solid rgba(124,58,237,0.3)",
        borderRadius: 24, width: "100%", maxWidth: 480,
        maxHeight: "85vh", display: "flex", flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Header */}
        <div style={{ padding: "24px 24px 16px", flexShrink: 0, borderBottom: "1px solid rgba(124,58,237,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Users size={20} color="#a78bfa" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, color: "#f0f0ff" }}>Group Members</div>
                <div style={{ fontSize: 12, color: "rgba(167,139,250,0.4)", marginTop: 1 }}>{members.length} members</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {canManage && (
                <button
                  onClick={() => setShowAddUser(v => !v)}
                  title="Add member"
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 12px", borderRadius: 9, cursor: "pointer",
                    background: showAddUser ? "rgba(74,222,128,0.2)" : "rgba(74,222,128,0.1)",
                    border: "1px solid rgba(74,222,128,0.25)", color: "#4ade80",
                    fontSize: 12, fontWeight: 600,
                  }}
                >
                  <UserPlus size={14} /> Add
                </button>
              )}
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(167,139,250,0.5)", fontSize: 22 }}>×</button>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "9px 14px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(124,58,237,0.2)",
              borderRadius: 10, color: "#f0f0ff", fontSize: 13, outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Add user panel */}
        {showAddUser && canManage && (
          <div style={{ padding: "12px 24px", borderBottom: "1px solid rgba(124,58,237,0.1)", background: "rgba(74,222,128,0.03)", flexShrink: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>Add Members</div>
            <input
              type="text"
              placeholder="Search users to add..."
              value={addSearch}
              onChange={e => setAddSearch(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", marginBottom: 8,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(74,222,128,0.2)",
                borderRadius: 8, color: "#f0f0ff", fontSize: 13, outline: "none",
                boxSizing: "border-box",
              }}
            />
            <div style={{ maxHeight: 140, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              {nonMembers.length === 0 ? (
                <div style={{ textAlign: "center", fontSize: 12, color: "rgba(167,139,250,0.3)", padding: "12px 0", fontStyle: "italic" }}>
                  {addSearch ? "No matching users" : "All users are already members"}
                </div>
              ) : nonMembers.slice(0, 10).map(u => (
                <div key={u._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar src={u.profileImage} name={u.nickName || u.name} size={28} />
                    <span style={{ fontSize: 13, color: "#f0f0ff" }}>{u.nickName || u.name}</span>
                  </div>
                  <button
                    onClick={() => handleAddMember(u._id)}
                    disabled={actionLoading === u._id + "_add"}
                    style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer",
                      background: "rgba(74,222,128,0.15)", color: "#4ade80",
                      border: "1px solid rgba(74,222,128,0.25)",
                    }}
                  >
                    {actionLoading === u._id + "_add" ? "..." : "+ Add"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 24px 16px" }}>
          {filteredMembers.map(member => {
            const memberId = (member._id || member).toString();
            const user = usersMap[memberId] || member;
            const role = getRoleLabel(memberId);
            const isMe = memberId === currentUserId;
            const isThisMainAdmin = memberId === mainAdminId;
            const isThisSubAdmin = groupAdminIds.includes(memberId);
            const loadingPrefix = memberId;

            return (
              <div key={memberId} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 12,
                marginBottom: 2,
                border: "1px solid transparent",
                transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.06)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
              >
                {/* Avatar — clickable to open DM */}
                <div
                  onClick={() => !isMe && onUserClick({ _id: memberId, ...user })}
                  style={{ cursor: isMe ? "default" : "pointer", flexShrink: 0 }}
                >
                  <Avatar src={user.profileImage} name={user.nickName || user.name} size={40} />
                </div>

                {/* Name + role */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#f0f0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.nickName || user.name || "Unknown"}
                    </span>
                    {isMe && <span style={{ fontSize: 10, color: "rgba(167,139,250,0.4)" }}>(you)</span>}
                  </div>
                  {role.label !== "Member" && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 3,
                      fontSize: 10, padding: "1px 7px", borderRadius: 99, marginTop: 2,
                      background: role.bg, color: role.color, border: `1px solid ${role.border}`,
                      fontWeight: 700,
                    }}>
                      {role.icon} {role.label}
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                {!isMe && (
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {/* Promote to admin (only main admin or app admin, not already admin) */}
                    {canPromote && !isThisMainAdmin && !isThisSubAdmin && (
                      <ActionBtn
                        icon={<Shield size={13} />}
                        label="Promote"
                        color="#a78bfa"
                        bg="rgba(124,58,237,0.12)"
                        title="Promote to Sub-Admin"
                        loading={actionLoading === loadingPrefix + "_promote"}
                        onClick={() => handlePromote(memberId)}
                      />
                    )}

                    {/* Demote sub-admin (only main admin or app admin) */}
                    {canPromote && isThisSubAdmin && !isThisMainAdmin && (
                      <ActionBtn
                        icon={<ChevronDown size={13} />}
                        label="Demote"
                        color="#f97316"
                        bg="rgba(249,115,22,0.1)"
                        title="Demote to Member"
                        loading={actionLoading === loadingPrefix + "_demote"}
                        onClick={() => handleDemote(memberId)}
                      />
                    )}

                    {/* Remove member (group admins can remove non-admins; app admin can remove anyone) */}
                    {canManage && (isAppAdmin || !isThisMainAdmin) && (
                      <ActionBtn
                        icon={<UserMinus size={13} />}
                        label=""
                        color="#fb7185"
                        bg="rgba(244,63,94,0.1)"
                        title="Remove from group"
                        loading={actionLoading === loadingPrefix + "_remove"}
                        onClick={() => handleRemove(memberId)}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Avatar({ src, name, size = 40 }) {
  return src ? (
    <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(124,58,237,0.35)", flexShrink: 0 }} />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: Math.round(size * 0.38), color: "white",
      border: "2px solid rgba(124,58,237,0.3)",
    }}>
      {(name || "?")[0]?.toUpperCase()}
    </div>
  );
}

function ActionBtn({ icon, label, color, bg, title, loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={title}
      style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: label ? "4px 9px" : "4px 8px",
        borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer",
        background: bg, color: color,
        border: `1px solid ${color}30`,
        opacity: loading ? 0.5 : 1, transition: "all 0.15s",
      }}
    >
      {loading ? "..." : <>{icon}{label && <span>{label}</span>}</>}
    </button>
  );
}
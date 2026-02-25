import React, { useState } from "react";
import { Users, X, Crown, Shield, UserMinus, ChevronDown, UserPlus } from "lucide-react";
import { promoteToGroupAdmin, demoteGroupAdmin, removeGroupMember, addGroupMember } from "../api/api";

function Avatar({ src, name, size = 40 }) {
  return src
    ? <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(124,58,237,0.35)", flexShrink: 0 }} />
    : <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: Math.round(size * 0.38), color: "white", border: "2px solid rgba(124,58,237,0.3)" }}>
        {(name || "?")[0]?.toUpperCase()}
      </div>;
}

export default function GroupMembersModal({ room, usersMap, currentUser, allUsers, onClose, onUserClick, onRoomUpdated }) {
  const [loading, setLoading]       = useState(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [search, setSearch]         = useState("");
  const [addSearch, setAddSearch]   = useState("");

  const members      = room?.members || [];
  const mainAdminId  = (room?.mainAdmin?._id || room?.mainAdmin)?.toString();
  const adminIds     = (room?.groupAdmins || []).map(a => (a._id || a).toString());
  const meId         = currentUser?._id?.toString();
  const isAppAdmin   = currentUser?.role === "admin";
  const isMainAdmin  = mainAdminId === meId;
  const isGrpAdmin   = isMainAdmin || adminIds.includes(meId);
  const canManage    = isAppAdmin || isGrpAdmin;
  const canPromote   = isAppAdmin || isMainAdmin;

  const roleOf = id => {
    if (id === mainAdminId) return { label: "Main Admin", icon: <Crown size={11} />, color: "#f9a8d4", bg: "rgba(236,72,153,0.15)", border: "rgba(236,72,153,0.3)" };
    if (adminIds.includes(id)) return { label: "Admin", icon: <Shield size={11} />, color: "#a78bfa", bg: "rgba(124,58,237,0.15)", border: "rgba(124,58,237,0.3)" };
    return { label: "Member", icon: null, color: "rgba(167,139,250,0.4)", bg: "transparent", border: "transparent" };
  };

  const act = async (key, fn) => { setLoading(key); try { onRoomUpdated(await fn()); } catch (e) { alert(e.message); } setLoading(null); };

  const filteredMembers = members.filter(m => {
    const u = usersMap[(m._id || m).toString()] || m;
    return (u.nickName || u.name || "").toLowerCase().includes(search.toLowerCase());
  });

  const memberIds = members.map(m => (m._id || m).toString());
  const nonMembers = (allUsers || []).filter(u => !memberIds.includes(u._id?.toString()) && (u.nickName || u.name || "").toLowerCase().includes(addSearch.toLowerCase()));

  return (
    <div className="modal-backdrop">
      <div className="members-modal">
        {/* Header */}
        <div className="members-header">
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
                <button onClick={() => setShowAdd(v => !v)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 9, cursor: "pointer", background: showAdd ? "rgba(74,222,128,0.2)" : "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", color: "#4ade80", fontSize: 12, fontWeight: 600 }}>
                  <UserPlus size={14} /> Add
                </button>
              )}
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(167,139,250,0.5)", fontSize: 22 }}>×</button>
            </div>
          </div>
          <input type="text" placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} className="members-search" />
        </div>

        {/* Add panel */}
        {showAdd && canManage && (
          <div className="members-add-panel">
            <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>Add Members</div>
            <input type="text" placeholder="Search users to add..." value={addSearch} onChange={e => setAddSearch(e.target.value)} className="add-search" />
            <div style={{ maxHeight: 140, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              {nonMembers.length === 0
                ? <div style={{ textAlign: "center", fontSize: 12, color: "rgba(167,139,250,0.3)", padding: "12px 0", fontStyle: "italic" }}>{addSearch ? "No matching users" : "All users are already members"}</div>
                : nonMembers.slice(0, 10).map(u => (
                  <div key={u._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar src={u.profileImage} name={u.nickName || u.name} size={28} />
                      <span style={{ fontSize: 13, color: "#f0f0ff" }}>{u.nickName || u.name}</span>
                    </div>
                    <button className="action-btn" style={{ color: "#4ade80", background: "rgba(74,222,128,0.15)", borderColor: "rgba(74,222,128,0.25)" }}
                      disabled={loading === u._id + "_add"}
                      onClick={() => act(u._id + "_add", () => addGroupMember(room._id, u._id))}>
                      {loading === u._id + "_add" ? "..." : "+ Add"}
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Members list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 24px 16px" }}>
          {filteredMembers.map(member => {
            const id   = (member._id || member).toString();
            const user = usersMap[id] || member;
            const role = roleOf(id);
            const isMe = id === meId;
            const isMAdmin = id === mainAdminId;
            const isSAdmin = adminIds.includes(id);

            return (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, marginBottom: 2, border: "1px solid transparent", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.06)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}>

                <div onClick={() => !isMe && onUserClick({ _id: id, ...user })} style={{ cursor: isMe ? "default" : "pointer", flexShrink: 0 }}>
                  <Avatar src={user.profileImage} name={user.nickName || user.name} size={40} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#f0f0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.nickName || user.name || "Unknown"}
                    </span>
                    {isMe && <span style={{ fontSize: 10, color: "rgba(167,139,250,0.4)" }}>(you)</span>}
                  </div>
                  {role.label !== "Member" && (
                    <span className="role-badge" style={{ background: role.bg, color: role.color, borderColor: role.border }}>
                      {role.icon} {role.label}
                    </span>
                  )}
                </div>

                {!isMe && (
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {canPromote && !isMAdmin && !isSAdmin && (
                      <button className="action-btn" style={{ color: "#a78bfa", background: "rgba(124,58,237,0.12)", borderColor: "rgba(124,58,237,0.3)" }}
                        title="Promote to Sub-Admin" disabled={loading === id + "_promote"}
                        onClick={() => act(id + "_promote", () => promoteToGroupAdmin(room._id, id))}>
                        {loading === id + "_promote" ? "..." : <><Shield size={13} /> Promote</>}
                      </button>
                    )}
                    {canPromote && isSAdmin && !isMAdmin && (
                      <button className="action-btn" style={{ color: "#f97316", background: "rgba(249,115,22,0.1)", borderColor: "rgba(249,115,22,0.3)" }}
                        title="Demote to Member" disabled={loading === id + "_demote"}
                        onClick={() => act(id + "_demote", () => demoteGroupAdmin(room._id, id))}>
                        {loading === id + "_demote" ? "..." : <><ChevronDown size={13} /> Demote</>}
                      </button>
                    )}
                    {canManage && (isAppAdmin || !isMAdmin) && (
                      <button className="action-btn" style={{ color: "#fb7185", background: "rgba(244,63,94,0.1)", borderColor: "rgba(244,63,94,0.3)" }}
                        title="Remove from group" disabled={loading === id + "_remove"}
                        onClick={() => window.confirm("Remove this member?") && act(id + "_remove", () => removeGroupMember(room._id, id))}>
                        {loading === id + "_remove" ? "..." : <UserMinus size={13} />}
                      </button>
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
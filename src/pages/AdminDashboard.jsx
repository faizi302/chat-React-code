// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllUsers, deleteUser, toggleUserStatus,
  getVisibleUsers, setVisibleUsers,
  getAllRooms, deleteRoom, clearRoomChat,
  promoteToGroupAdmin, demoteGroupAdmin, removeGroupMember,
} from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Users,
  Shield,
  UserCheck,
  MessageCircle,
  Trash2,
  Settings,
  Eye,
  RefreshCw,
  ArrowLeft,
  LogOut,
  Lock,
  Icon
} from "lucide-react";

// ── Avatar ─────────────────────────────────────────────────────
function Avatar({ src, name, size = 36 }) {
  return src ? (
    <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(124,58,237,0.35)", flexShrink: 0 }} />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: Math.round(size * 0.4), color: "white",
      border: "2px solid rgba(124,58,237,0.3)",
    }}>
      {(name || "?")[0]?.toUpperCase()}
    </div>
  );
}

// ── Visibility Modal ───────────────────────────────────────────
function VisibilityModal({ targetUser, allUsers, currentAdminId, onClose, onSave }) {
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

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

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
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

  const eligibleUsers = allUsers.filter(u =>
    u._id !== targetUser._id &&
    u._id !== currentAdminId &&
    u.role !== "admin" &&
    (u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const allSelected = eligibleUsers.length > 0 && eligibleUsers.every(u => selected.has(u._id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(prev => { const next = new Set(prev); eligibleUsers.forEach(u => next.delete(u._id)); return next; });
    } else {
      setSelected(prev => { const next = new Set(prev); eligibleUsers.forEach(u => next.add(u._id)); return next; });
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#12122a", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 24, width: "100%", maxWidth: 520, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,0.7)", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ padding: "24px 28px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar src={targetUser.profileImage} name={targetUser.name} size={42} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#f0f0ff" }}>Sidebar Visibility</div>
                <div style={{ fontSize: 12, color: "rgba(167,139,250,0.5)", marginTop: 2 }}>
                  Who can <strong style={{ color: "#a78bfa" }}>{targetUser.nickName || targetUser.name}</strong> see?
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(167,139,250,0.5)", fontSize: 22 }}>×</button>
          </div>
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid rgba(124,58,237,0.2)", background: "rgba(255,255,255,0.04)", borderRadius: 10, color: "#f0f0ff", fontSize: 13, outline: "none", boxSizing: "border-box", margin: "16px 0 0", fontFamily: "'DM Sans', sans-serif" }}
          />
          {!loading && eligibleUsers.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "rgba(167,139,250,0.7)", userSelect: "none" }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ width: 16, height: 16, accentColor: "#7c3aed" }} />
                Select all ({eligibleUsers.length})
              </label>
              <span style={{ fontSize: 12, color: "rgba(167,139,250,0.4)" }}>{selected.size} selected</span>
            </div>
          )}
          <div style={{ height: 1, background: "rgba(124,58,237,0.15)" }} />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 28px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "rgba(167,139,250,0.4)" }}>Loading...</div>
          ) : eligibleUsers.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "rgba(167,139,250,0.3)", fontSize: 13 }}>{search ? "No matches" : "No other users"}</div>
          ) : eligibleUsers.map(u => {
            const isChecked = selected.has(u._id);
            return (
              <label key={u._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 12px", borderRadius: 12, cursor: "pointer", margin: "2px 0", userSelect: "none", background: isChecked ? "rgba(124,58,237,0.12)" : "transparent", border: isChecked ? "1px solid rgba(124,58,237,0.25)" : "1px solid transparent", transition: "all 0.15s" }}>
                <input type="checkbox" checked={isChecked} onChange={() => toggleSelect(u._id)} style={{ width: 17, height: 17, accentColor: "#7c3aed", cursor: "pointer", flexShrink: 0 }} />
                <Avatar src={u.profileImage} name={u.name} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#f0f0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.nickName || u.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(167,139,250,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                </div>
                {isChecked && <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", background: "rgba(74,222,128,0.1)", padding: "2px 8px", borderRadius: 99, flexShrink: 0 }}>Allowed</span>}
              </label>
            );
          })}
        </div>
        <div style={{ padding: "16px 28px 24px", borderTop: "1px solid rgba(124,58,237,0.15)", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 11, border: "1px solid rgba(124,58,237,0.25)", background: "rgba(124,58,237,0.08)", color: "#a78bfa", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "12px", borderRadius: 11, border: "none", cursor: saving ? "not-allowed" : "pointer", background: saving ? "rgba(124,58,237,0.25)" : "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "white", fontSize: 14, fontWeight: 700 }}>
              {saving ? "Saving..." : `✓ Save Permissions (${selected.size} users)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Group Detail Modal ─────────────────────────────────────────
function GroupDetailModal({ room, allUsers, onClose, onRoomUpdated, onDeleteRoom, onClearChat }) {
  const [actionLoading, setActionLoading] = useState(null);
  const mainAdminId = (room.mainAdmin?._id || room.mainAdmin)?.toString();
  const groupAdminIds = (room.groupAdmins || []).map(a => (a._id || a).toString());

  const getRoleInfo = (userId) => {
    const id = userId.toString();
    if (id === mainAdminId) return { label: "Main Admin", color: "#f9a8d4", bg: "rgba(236,72,153,0.15)" };
    if (groupAdminIds.includes(id)) return { label: "Admin", color: "#a78bfa", bg: "rgba(124,58,237,0.15)" };
    return { label: "Member", color: "rgba(167,139,250,0.4)", bg: "transparent" };
  };

  const handlePromote = async (userId) => {
    setActionLoading(userId + "_promote");
    try { const updated = await promoteToGroupAdmin(room._id, userId); onRoomUpdated(updated); }
    catch (e) { alert(e.message); }
    setActionLoading(null);
  };

  const handleDemote = async (userId) => {
    setActionLoading(userId + "_demote");
    try { const updated = await demoteGroupAdmin(room._id, userId); onRoomUpdated(updated); }
    catch (e) { alert(e.message); }
    setActionLoading(null);
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Remove this member?")) return;
    setActionLoading(userId + "_remove");
    try { const updated = await removeGroupMember(room._id, userId); onRoomUpdated(updated); }
    catch (e) { alert(e.message); }
    setActionLoading(null);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#12122a", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 24, width: "100%", maxWidth: 560, maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,0.7)", fontFamily: "'DM Sans', sans-serif" }}>
        {/* Header */}
        <div style={{ padding: "24px 28px 16px", borderBottom: "1px solid rgba(124,58,237,0.1)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar src={room.profileImage} name={room.name} size={48} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, color: "#f0f0ff" }}>{room.name}</div>
                <div style={{ fontSize: 12, color: "rgba(167,139,250,0.4)", marginTop: 2 }}>{room.members?.length || 0} members · Group</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(167,139,250,0.5)", fontSize: 22 }}>×</button>
          </div>
          {/* Admin actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={onClearChat} style={{ padding: "7px 14px", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", background: "rgba(251,113,133,0.1)", color: "#fb7185", border: "1px solid rgba(251,113,133,0.2)" }}>
              🗑 Clear Chat
            </button>
            <button onClick={onDeleteRoom} style={{ padding: "7px 14px", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              🗑 Delete Group
            </button>
            {room.onlyAdminCanSend && (
              <span style={{ padding: "7px 12px", borderRadius: 9, fontSize: 11, fontWeight: 700, background: "rgba(251,113,133,0.1)", color: "#fb7185", border: "1px solid rgba(251,113,133,0.2)" }}>
                🔒 Admin-Only Send
              </span>
            )}
          </div>
        </div>

        {/* Members list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 28px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(167,139,250,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Members</div>
          {(room.members || []).map(member => {
            const memberId = (member._id || member).toString();
            const user = member._id ? member : { name: "Unknown", profileImage: "" };
            const role = getRoleInfo(memberId);
            const isSubAdmin = groupAdminIds.includes(memberId);
            const isMain = memberId === mainAdminId;

            return (
              <div key={memberId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 11, marginBottom: 2, border: "1px solid transparent", transition: "all 0.12s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.06)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
              >
                <Avatar src={user.profileImage} name={user.nickName || user.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.nickName || user.name || "Unknown"}</div>
                  <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99, background: role.bg, color: role.color, fontWeight: 700 }}>{role.label}</span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {!isMain && !isSubAdmin && (
                    <button onClick={() => handlePromote(memberId)} disabled={actionLoading === memberId + "_promote"}
                      style={{ padding: "4px 9px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>
                      {actionLoading === memberId + "_promote" ? "..." : "↑ Promote"}
                    </button>
                  )}
                  {isSubAdmin && !isMain && (
                    <button onClick={() => handleDemote(memberId)} disabled={actionLoading === memberId + "_demote"}
                      style={{ padding: "4px 9px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(249,115,22,0.1)", color: "#f97316", border: "1px solid rgba(249,115,22,0.2)" }}>
                      {actionLoading === memberId + "_demote" ? "..." : "↓ Demote"}
                    </button>
                  )}
                  <button onClick={() => handleRemove(memberId)} disabled={actionLoading === memberId + "_remove"}
                    style={{ padding: "4px 9px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(244,63,94,0.1)", color: "#fb7185", border: "1px solid rgba(244,63,94,0.15)" }}>
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

// ── Main AdminDashboard ────────────────────────────────────────
export default function AdminDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("users"); // "users" | "groups"
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [visibilityTarget, setVisibilityTarget] = useState(null);
  const [groupDetailTarget, setGroupDetailTarget] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data || []);
    setLoading(false);
  }, []);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    const data = await getAllRooms();
    setGroups(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    else fetchGroups();
  }, [activeTab, fetchUsers, fetchGroups]);

  const handleToggle = async (userId) => {
    setActionLoading(userId + "_toggle");
    try {
      const res = await toggleUserStatus(userId);
      if (res?.user) setUsers(prev => prev.map(u => u._id === userId ? res.user : u));
    } catch (e) { alert(e.message); }
    setActionLoading(null);
  };

  const handleDelete = async (userId) => {
    setActionLoading(userId + "_delete");
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (e) { alert(e.message); }
    setActionLoading(null);
    setConfirmDelete(null);
  };

  const handleDeleteGroup = async (roomId) => {
    try {
      await deleteRoom(roomId);
      setGroups(prev => prev.filter(g => g._id !== roomId));
      if (groupDetailTarget?._id === roomId) setGroupDetailTarget(null);
    } catch (e) { alert(e.message); }
  };

  const handleClearGroupChat = async (roomId) => {
    if (!window.confirm("Clear all messages in this group?")) return;
    try {
      await clearRoomChat(roomId);
      alert("Chat cleared.");
    } catch (e) { alert(e.message); }
  };

  const handleGroupRoomUpdated = (updatedRoom) => {
    setGroups(prev => prev.map(g => g._id === updatedRoom._id ? updatedRoom : g));
    if (groupDetailTarget?._id === updatedRoom._id) setGroupDetailTarget(updatedRoom);
  };

  const filtered = activeTab === "users"
    ? users.filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
    )
    : groups.filter(g =>
      g.name?.toLowerCase().includes(search.toLowerCase())
    );

  const card = {
    background: "#12122a",
    border: "1px solid rgba(124,58,237,0.2)",
    borderRadius: 20,
    padding: 28,
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div style={{ minHeight: "screen", background: "#09091a", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Modals */}
      {visibilityTarget && (
        <VisibilityModal
          targetUser={visibilityTarget}
          allUsers={users}
          currentAdminId={currentUser?._id}
          onClose={() => setVisibilityTarget(null)}
          onSave={() => { }}
        />
      )}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#181830", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 20, padding: "32px 28px", maxWidth: 360, width: "100%", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f0f0ff", marginBottom: 12 }}>Delete User?</div>
            <p style={{ color: "rgba(167,139,250,0.5)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>This permanently deletes the user and all their data.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ ...secondaryBtn, flex: 1 }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={!!actionLoading} style={{ ...dangerBtn, flex: 1 }}>
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {groupDetailTarget && (
        <GroupDetailModal
          room={groupDetailTarget}
          allUsers={users}
          onClose={() => setGroupDetailTarget(null)}
          onRoomUpdated={handleGroupRoomUpdated}
          onDeleteRoom={() => { if (window.confirm("Delete this group permanently?")) handleDeleteGroup(groupDetailTarget._id); }}
          onClearChat={() => handleClearGroupChat(groupDetailTarget._id)}
        />
      )}

      {/* Top nav */}
<div
  style={{
    background: "linear-gradient(110deg,#0f0c29,#1a1040,#24243e)",
    borderBottom: "1px solid rgba(124,58,237,0.2)",
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    position: "relative",
  }}
>
  {/* Title */}
  <span
    style={{
      fontWeight: 800,
      fontSize: 18,
      background: "linear-gradient(90deg,#a78bfa,#67e8f9)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    Admin Dashboard
  </span>

  {/* Desktop Buttons */}
  <div className="desktopHeader">
    <button onClick={() => navigate("/")} style={secondaryBtn}>
      <ArrowLeft size={16} style={{ marginRight: 6 }} />
      Back
    </button>

    <button
      onClick={async () => {
        await logout();
        navigate("/login");
      }}
      style={dangerBtnSm}
    >
      <LogOut size={16} style={{ marginRight: 6 }} />
      Logout
    </button>
  </div>

  {/* Mobile Menu Button */}
  <button
    className="mobileMenuBtn"
    onClick={() => setShowMobileMenu(!showMobileMenu)}
    style={{
      background: "transparent",
      border: "none",
      color: "#a78bfa",
      cursor: "pointer",
    }}
  >
    <Settings size={22} />
  </button>

  {/* Mobile Dropdown */}
  {showMobileMenu && (
    <div
      style={{
        position: "absolute",
        top: 64,
        right: 10,
        background: "#181830",
        border: "1px solid rgba(124,58,237,0.3)",
        borderRadius: 12,
        padding: 10,
        width: 180,
        zIndex: 1000,
      }}
    >
      <button
        onClick={() => {
          navigate("/");
          setShowMobileMenu(false);
        }}
        style={{ ...secondaryBtn, width: "100%", marginBottom: 8 }}
      >
        <ArrowLeft size={16} style={{ marginRight: 6 }} />
        Back
      </button>

      <button
        onClick={async () => {
          await logout();
          navigate("/login");
          setShowMobileMenu(false);
        }}
        style={{ ...dangerBtnSm, width: "100%" }}
      >
        <LogOut size={16} style={{ marginRight: 6 }} />
        Logout
      </button>
    </div>
  )}
</div>

      <div style={{ padding: "28px 24px", maxWidth: "100%", height: "90vh", margin: "0 auto", overflowY: "auto" }}>
        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Users", value: users.length, color: "#a78bfa", icon: <Users size={20} /> },
            { label: "Active Users", value: users.filter(u => u.isActive !== false).length, color: "#4ade80", icon: <UserCheck size={20} /> },
            { label: "Admins", value: users.filter(u => u.role === "admin").length, color: "#f9a8d4", icon: <Shield size={20} /> },
            { label: "Total Groups", value: groups.length, color: "#67e8f9", icon: <MessageCircle size={20} /> },
          ].map(stat => (
            <div key={stat.label} style={{ ...card, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 13, color: "rgba(167,139,250,0.5)", marginTop: 4 }}>{stat.label}</div>
                </div>
                <div style={{
                  background: "rgba(124,58,237,0.08)",
                  padding: 10,
                  borderRadius: 12,
                  color: stat.color
                }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab bar + search */}
        <div style={{ ...card, padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 8 }}>
              {["users", "groups"].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSearch(""); }}
                  style={{
                    padding: "9px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
                    background: activeTab === tab ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(124,58,237,0.08)",
                    color: activeTab === tab ? "white" : "#a78bfa",
                    border: activeTab === tab ? "none" : "1px solid rgba(124,58,237,0.2)",
                    boxShadow: activeTab === tab ? "0 4px 16px rgba(124,58,237,0.4)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {tab === "users" ? "👤 Users" : "💬 Groups"}
                </button>
              ))}
            </div>

            {/* Search + refresh */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="text"
                placeholder={activeTab === "users" ? "Search users..." : "Search groups..."}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(124,58,237,0.2)", background: "rgba(255,255,255,0.04)", color: "#f0f0ff", fontSize: 13, outline: "none", width: 220, fontFamily: "'DM Sans', sans-serif" }}
              />
              <button onClick={() => activeTab === "users" ? fetchUsers() : fetchGroups()} style={secondaryBtn}>↻ Refresh</button>
            </div>
          </div>

          {/* ── USERS TABLE ── */}
          {activeTab === "users" && (
            loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(167,139,250,0.4)", fontSize: 15 }}>Loading users...</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(124,58,237,0.12)" }}>
                      {["User", "Email", "Phone", "Role", "Status", "Joined", "Actions"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, fontSize: 11, color: "rgba(167,139,250,0.5)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user, i) => {
                      const isMe = user._id === currentUser?._id;
                      const isActive = user.isActive !== false;
                      return (
                        <tr key={user._id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(124,58,237,0.07)" : "none" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.04)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <Avatar src={user.profileImage} name={user.name} size={36} />
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14, color: "#f0f0ff" }}>{user.nickName || user.name}</div>
                                {isMe && <span style={{ fontSize: 10, color: "#a78bfa" }}>• You</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", color: "rgba(167,139,250,0.55)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</td>
                          <td style={{ padding: "12px 16px", color: "rgba(167,139,250,0.55)" }}>{user.phone || "—"}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: user.role === "admin" ? "rgba(236,72,153,0.15)" : "rgba(124,58,237,0.12)", color: user.role === "admin" ? "#f9a8d4" : "#a78bfa", border: `1px solid ${user.role === "admin" ? "rgba(236,72,153,0.3)" : "rgba(124,58,237,0.2)"}` }}>
                              {user.role === "admin" ? "🛡 Admin" : "👤 User"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: isActive ? "rgba(74,222,128,0.1)" : "rgba(244,63,94,0.1)", color: isActive ? "#4ade80" : "#fb7185", border: `1px solid ${isActive ? "rgba(74,222,128,0.25)" : "rgba(244,63,94,0.25)"}` }}>
                              {isActive ? "● Active" : "● Disabled"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: "rgba(167,139,250,0.35)", whiteSpace: "nowrap" }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td>
                          <td style={{ padding: "12px 16px" }}>
                            {isMe ? <span style={{ fontSize: 12, color: "rgba(167,139,250,0.3)", fontStyle: "italic" }}>—</span> : (
                              <div style={{ display: "flex", gap: 5, flexWrap: "nowrap" }}>
                                <button onClick={() => handleToggle(user._id)} disabled={actionLoading === user._id + "_toggle"}
                                  style={{ padding: "5px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", background: isActive ? "rgba(244,63,94,0.1)" : "rgba(74,222,128,0.1)", color: isActive ? "#fb7185" : "#4ade80", border: `1px solid ${isActive ? "rgba(244,63,94,0.2)" : "rgba(74,222,128,0.2)"}`, whiteSpace: "nowrap" }}>
                                  {actionLoading === user._id + "_toggle" ? "..." : isActive ? "Disable" : "Enable"}
                                </button>
                                {user.role !== "admin" && (
                                  <button onClick={() => setVisibilityTarget(user)}
                                    style={{ padding: "5px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(6,182,212,0.1)", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.2)", whiteSpace: "nowrap" }}>
                                    👁 Sidebar
                                  </button>
                                )}
                                <button onClick={() => setConfirmDelete(user._id)}
                                  style={{ padding: "5px 10px", borderRadius: 7, fontSize: 13, cursor: "pointer", background: "rgba(244,63,94,0.08)", color: "#fb7185", border: "1px solid rgba(244,63,94,0.15)" }}>
                                  🗑
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && !loading && (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(167,139,250,0.3)", fontSize: 14, fontStyle: "italic" }}>
                    {search ? "No users match your search." : "No users found."}
                  </div>
                )}
              </div>
            )
          )}

          {/* ── GROUPS TABLE ── */}
          {activeTab === "groups" && (
            loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(167,139,250,0.4)", fontSize: 15 }}>Loading groups...</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(124,58,237,0.12)" }}>
                      {["Group", "Members", "Main Admin", "Settings", "Created", "Actions"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, fontSize: 11, color: "rgba(167,139,250,0.5)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((group, i) => {
                      const mainAdmin = group.mainAdmin;
                      return (
                        <tr key={group._id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(124,58,237,0.07)" : "none" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.04)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <Avatar src={group.profileImage} name={group.name} size={38} />
                              <div style={{ fontWeight: 600, fontSize: 14, color: "#f0f0ff" }}>{group.name}</div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", color: "rgba(167,139,250,0.6)" }}>{group.members?.length || 0}</td>
                          <td style={{ padding: "12px 16px" }}>
                            {mainAdmin ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Avatar src={mainAdmin.profileImage} name={mainAdmin.nickName || mainAdmin.name} size={24} />
                                <span style={{ fontSize: 13, color: "#f9a8d4" }}>{mainAdmin.nickName || mainAdmin.name || "—"}</span>
                              </div>
                            ) : <span style={{ color: "rgba(167,139,250,0.3)" }}>—</span>}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            {group.onlyAdminCanSend && (
                              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "rgba(251,113,133,0.12)", color: "#fb7185", border: "1px solid rgba(251,113,133,0.2)", fontWeight: 700 }}>🔒 Admin-Only</span>
                            )}
                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "rgba(124,58,237,0.1)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.18)", fontWeight: 700, marginLeft: group.onlyAdminCanSend ? 4 : 0 }}>
                              {group.groupAdmins?.length || 0} admins
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: "rgba(167,139,250,0.35)", whiteSpace: "nowrap" }}>
                            {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: 5 }}>
                              <button onClick={() => setGroupDetailTarget(group)}
                                style={{ padding: "5px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)", whiteSpace: "nowrap" }}>
                                ⚙ Manage
                              </button>
                              <button onClick={() => { if (window.confirm(`Delete group "${group.name}"?`)) handleDeleteGroup(group._id); }}
                                style={{ padding: "5px 10px", borderRadius: 7, fontSize: 13, cursor: "pointer", background: "rgba(244,63,94,0.08)", color: "#fb7185", border: "1px solid rgba(244,63,94,0.15)" }}>
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && !loading && (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(167,139,250,0.3)", fontSize: 14, fontStyle: "italic" }}>
                    {search ? "No groups match your search." : "No groups found."}
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* Legend */}
        <div style={{ marginTop: 20, padding: "14px 20px", background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 12, fontSize: 12, color: "rgba(103,232,249,0.6)", lineHeight: 1.7 }}>
          <strong style={{ color: "#67e8f9" }}>ℹ How it works:</strong> &nbsp;
          <strong>Users tab</strong> — manage accounts, sidebar visibility, enable/disable. &nbsp;
          <strong>Groups tab</strong> — view all groups, manage admins, clear chat, delete groups. &nbsp;
          App admins can perform all actions without being a group member.
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        input::placeholder { color: rgba(167,139,250,0.22); }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

const secondaryBtn = {
  padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(124,58,237,0.3)",
  background: "rgba(124,58,237,0.1)", color: "#a78bfa",
  cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
};
const dangerBtn = {
  padding: "9px 20px", borderRadius: 10, border: "1px solid rgba(244,63,94,0.3)",
  background: "rgba(244,63,94,0.15)", color: "#fb7185",
  cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
};
const dangerBtnSm = { ...dangerBtn, padding: "9px 14px" };
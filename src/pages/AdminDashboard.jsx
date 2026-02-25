import { useState, useEffect, useCallback } from "react";
import { Users, Shield, UserCheck, MessageCircle } from "lucide-react";
import {
  getAllUsers, deleteUser, toggleUserStatus,
  getAllRooms, deleteRoom, clearRoomChat,
} from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

// ── Sub-components ──────────────────────────────────────────────
import AdminNavbar       from "../components/admin/AdminNavbar.jsx";
import StatCard          from "../components/admin/StatCard.jsx";
import UsersTable        from "../components/admin/UserTable.jsx";
import GroupsTable       from "../components/admin/GroupsTable.jsx";
import VisibilityModal   from "../components/admin/VisibilityModal.jsx";
import GroupDetailModal  from "../components/admin/GroupDetailModal.jsx";
import DeleteConfirmModal from "../components/admin/DeleteConfirmModal.jsx";

export default function AdminDashboard() {
  const { currentUser } = useAuth();

  // ── State ──────────────────────────────────────────────────────
  const [activeTab,     setActiveTab]     = useState("users");   // "users" | "groups"
  const [users,         setUsers]         = useState([]);
  const [groups,        setGroups]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [actionLoading, setActionLoading] = useState(null);      // tracks which btn is busy

  // Modal state — null = closed, value = open with that data
  const [confirmDeleteId,   setConfirmDeleteId]   = useState(null);  // userId to delete
  const [visibilityTarget,  setVisibilityTarget]  = useState(null);  // user object
  const [groupDetailTarget, setGroupDetailTarget] = useState(null);  // group object

  // ── Data fetching ───────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try { setUsers(await getAllUsers() || []); }
    catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try { setGroups(await getAllRooms() || []); }
    catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  // Fetch whenever tab changes
  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    else fetchGroups();
  }, [activeTab, fetchUsers, fetchGroups]);

  // ── User actions ────────────────────────────────────────────────
  const handleToggleUser = async (userId) => {
    setActionLoading(userId + "_toggle");
    try {
      const res = await toggleUserStatus(userId);
      if (res?.user) setUsers(prev => prev.map(u => u._id === userId ? res.user : u));
    } catch (e) { alert(e.message); }
    setActionLoading(null);
  };

  const handleDeleteUser = async (userId) => {
    setActionLoading(userId + "_delete");
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (e) { alert(e.message); }
    setActionLoading(null);
    setConfirmDeleteId(null);
  };

  // ── Group actions ───────────────────────────────────────────────
  const handleDeleteGroup = async (roomId) => {
    try {
      await deleteRoom(roomId);
      setGroups(prev => prev.filter(g => g._id !== roomId));
      if (groupDetailTarget?._id === roomId) setGroupDetailTarget(null);
    } catch (e) { alert(e.message); }
  };

  const handleClearGroupChat = async (roomId) => {
    if (!window.confirm("Clear all messages in this group?")) return;
    try { await clearRoomChat(roomId); alert("Chat cleared."); }
    catch (e) { alert(e.message); }
  };

  // When a group is updated inside GroupDetailModal, sync it back to state
  const handleGroupUpdated = (updatedRoom) => {
    setGroups(prev => prev.map(g => g._id === updatedRoom._id ? updatedRoom : g));
    if (groupDetailTarget?._id === updatedRoom._id) setGroupDetailTarget(updatedRoom);
  };

  // ── Filtered data (search) ──────────────────────────────────────
  const lc = search.toLowerCase();
  const filtered = activeTab === "users"
    ? users.filter(u =>
        u.name?.toLowerCase().includes(lc) ||
        u.email?.toLowerCase().includes(lc) ||
        u.phone?.includes(search)
      )
    : groups.filter(g => g.name?.toLowerCase().includes(lc));

  // ── Stat card data ──────────────────────────────────────────────
  const stats = [
    { label: "Total Users",  value: users.length,                               color: "#a78bfa", icon: <Users size={20} /> },
    { label: "Active Users", value: users.filter(u => u.isActive !== false).length, color: "#4ade80", icon: <UserCheck size={20} /> },
    { label: "Admins",       value: users.filter(u => u.role === "admin").length,    color: "#f9a8d4", icon: <Shield size={20} /> },
    { label: "Total Groups", value: groups.length,                              color: "#67e8f9", icon: <MessageCircle size={20} /> },
  ];

  // ── Shared card style ───────────────────────────────────────────
  const card = {
    background: "#12122a",
    border: "1px solid rgba(124,58,237,0.2)",
    borderRadius: 20,
    padding: "20px 24px",
    fontFamily: "'DM Sans', sans-serif",
  };

  // ── Shared button styles ────────────────────────────────────────
  const secondaryBtn = {
    padding: "9px 16px", borderRadius: 10,
    border: "1px solid rgba(124,58,237,0.3)",
    background: "rgba(124,58,237,0.1)", color: "#a78bfa",
    cursor: "pointer", fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans',sans-serif",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09091a", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Modals ─────────────────────────────────────────────── */}

      {/* Sidebar visibility modal */}
      {visibilityTarget && (
        <VisibilityModal
          targetUser={visibilityTarget}
          allUsers={users}
          currentAdminId={currentUser?._id}
          onClose={() => setVisibilityTarget(null)}
          onSave={() => {}} // refresh handled optimistically
        />
      )}

      {/* Delete user confirmation */}
      {confirmDeleteId && (
        <DeleteConfirmModal
          isLoading={!!actionLoading}
          onConfirm={() => handleDeleteUser(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {/* Group detail / management modal */}
      {groupDetailTarget && (
        <GroupDetailModal
          room={groupDetailTarget}
          onClose={() => setGroupDetailTarget(null)}
          onRoomUpdated={handleGroupUpdated}
          onDeleteRoom={() => {
            if (window.confirm("Delete this group permanently?")) handleDeleteGroup(groupDetailTarget._id);
          }}
          onClearChat={() => handleClearGroupChat(groupDetailTarget._id)}
        />
      )}

      {/* ── Top navbar ─────────────────────────────────────────── */}
      <AdminNavbar />

      {/* ── Page content ───────────────────────────────────────── */}
      <div style={{ padding: "28px 24px", height: "calc(100vh - 64px)", overflowY: "auto" }}>

        {/* ── Stat cards row ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {/* Single StatCard component reused 4 times */}
          {stats.map(s => (
            <StatCard key={s.label} label={s.label} value={s.value} color={s.color} icon={s.icon} />
          ))}
        </div>

        {/* ── Table card ── */}
        <div style={card}>

          {/* Tab bar + search + refresh */}
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 12, marginBottom: 20,
            }}
          >
            {/* Tabs */}
            <div style={{ display: "flex", gap: 8 }}>
              {["users", "groups"].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSearch(""); }}
                  style={{
                    padding: "9px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
                    background: activeTab === tab ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(124,58,237,0.08)",
                    color:      activeTab === tab ? "white" : "#a78bfa",
                    border:     activeTab === tab ? "none" : "1px solid rgba(124,58,237,0.2)",
                    boxShadow:  activeTab === tab ? "0 4px 16px rgba(124,58,237,0.4)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {tab === "users" ? "👤 Users" : "💬 Groups"}
                </button>
              ))}
            </div>

            {/* Search + Refresh */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="text"
                placeholder={activeTab === "users" ? "Search users..." : "Search groups..."}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  padding: "9px 14px", borderRadius: 10,
                  border: "1px solid rgba(124,58,237,0.2)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#f0f0ff", fontSize: 13, outline: "none",
                  width: 220, fontFamily: "'DM Sans', sans-serif",
                }}
              />
              <button
                onClick={() => activeTab === "users" ? fetchUsers() : fetchGroups()}
                style={secondaryBtn}
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {/* ── Users tab — uses UsersTable which uses DataTable ── */}
          {activeTab === "users" && (
            <UsersTable
              users={filtered}
              loading={loading}
              search={search}
              currentUserId={currentUser?._id}
              actionLoading={actionLoading}
              onToggle={handleToggleUser}
              onSidebar={setVisibilityTarget}
              onDelete={setConfirmDeleteId}
            />
          )}

          {/* ── Groups tab — uses GroupsTable which uses DataTable ── */}
          {activeTab === "groups" && (
            <GroupsTable
              groups={filtered}
              loading={loading}
              search={search}
              onManage={setGroupDetailTarget}
              onDelete={handleDeleteGroup}
            />
          )}
        </div>

        {/* ── Info legend ── */}
        <div
          style={{
            marginTop: 20,
            padding: "14px 20px",
            background: "rgba(6,182,212,0.05)",
            border: "1px solid rgba(6,182,212,0.15)",
            borderRadius: 12,
            fontSize: 12,
            color: "rgba(103,232,249,0.6)",
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: "#67e8f9" }}>ℹ How it works:</strong>&nbsp;
          <strong>Users tab</strong> — manage accounts, sidebar visibility, enable/disable.&nbsp;
          <strong>Groups tab</strong> — view all groups, manage admins, clear chat, delete groups.&nbsp;
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
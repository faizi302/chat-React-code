// Sidebar.jsx
import React, { useState } from "react";
import { Edit, Search, ChevronDown, ChevronUp, Hash, MessageSquare, Users } from "lucide-react";

export default function Sidebar({
  allUsers,
  onlineMap,
  usersMap,
  rooms = [],
  onSelectUser,
  onSelectRoom,
  activeRoomId,
  currentUserId,
  onEditGroup,
  isOpen,
}) {
  const [showGroups, setShowGroups] = useState(true);
  const [showDMs, setShowDMs]       = useState(true);
  const [showUsers, setShowUsers]   = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const q = searchQuery.toLowerCase();
  const currentUserStr = currentUserId?.toString() ?? "";

  /* ─ Groups ─ */
  const groupRooms = rooms
    .filter(r => r?.type === "group")
    .filter(r => r.name?.toLowerCase().includes(q));

  /* ─ Private chats ─ */
  const privateChats = rooms
    .filter(r => r?.type === "private")
    .map(room => {
      if (!room?.members || room.members.length !== 2) return null;
      let otherId = null;
      for (const m of room.members) {
        const id = m?._id ? m._id.toString() : m?.toString?.() ?? m;
        if (id && id !== currentUserStr) { otherId = id; break; }
      }
      if (!otherId) return null;
      const otherUser =
        allUsers.find(u => u._id?.toString() === otherId) ||
        (usersMap[otherId]
          ? { _id: otherId, nickName: usersMap[otherId].nickName || "Unknown", profileImage: usersMap[otherId].profileImage || "", lastSeen: usersMap[otherId].lastSeen }
          : null);
      if (!otherUser) return null;
      return { user: otherUser, room, lastActivity: room.lastActivity || room.createdAt };
    })
    .filter(Boolean)
    .filter(({ user }) => user.nickName?.toLowerCase().includes(q))
    .sort((a, b) => new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0));

  /* ─ All users ─ */
  const filteredUsers = allUsers
    .filter(u => u?._id?.toString() !== currentUserStr)
    .filter(u => (u.nickName || "").toLowerCase().includes(q));

  /* ── Avatar ── */
  const Avatar = ({ src, name, size = 44 }) => {
    const letter = name?.[0]?.toUpperCase() || "?";
    return src ? (
      <img
        src={src} alt={name}
        style={{
          width: size, height: size, borderRadius: "50%",
          objectFit: "cover", flexShrink: 0,
          border: "2px solid rgba(124,58,237,0.45)",
          boxShadow: "0 0 10px rgba(124,58,237,0.25)",
        }}
      />
    ) : (
      <div style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Syne',sans-serif", fontWeight: 700,
        fontSize: Math.round(size * 0.38), color: "white",
        border: "2px solid rgba(124,58,237,0.4)",
        boxShadow: "0 0 10px rgba(124,58,237,0.2)",
      }}>
        {letter}
      </div>
    );
  };

  /* ── Online dot ── */
  const StatusDot = ({ online }) => (
    <div style={{
      position: "absolute", bottom: 1, right: 1,
      width: 12, height: 12, borderRadius: "50%",
      background: online ? "#4ade80" : "#4b5563",
      border: "2.5px solid #0d0d1f",
      boxShadow: online ? "0 0 6px #4ade80" : "none",
      zIndex: 1,
    }} />
  );

  /* ── Unread badge ── */
  const Badge = ({ count }) => !count ? null : (
    <div style={{
      position: "absolute", top: -3, right: -3,
      minWidth: 20, height: 20, borderRadius: 99,
      background: "linear-gradient(135deg,#ec4899,#f43f5e)",
      color: "white", fontSize: 10, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "0 4px", border: "2.5px solid #0d0d1f",
      boxShadow: "0 0 8px rgba(236,72,153,0.7)", zIndex: 2,
    }}>
      {count}
    </div>
  );

  /* ── Row item ── */
  const Row = ({ isActive, onClick, tooltip, children }) => (
    <div
      onClick={onClick}
      title={!isOpen ? tooltip : undefined}
      style={{
        display: "flex", alignItems: "center",
        gap: isOpen ? 12 : 0,
        justifyContent: isOpen ? "flex-start" : "center",
        padding: isOpen ? "10px 12px" : "10px 0",
        borderRadius: 14, cursor: "pointer", marginBottom: 4,
        transition: "background 0.15s, border 0.15s",
        background: isActive
          ? "linear-gradient(135deg,rgba(124,58,237,0.28),rgba(6,182,212,0.1))"
          : "transparent",
        border: isActive
          ? "1px solid rgba(124,58,237,0.4)"
          : "1px solid transparent",
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(124,58,237,0.1)"; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </div>
  );

  /* ── Section header ── */
  const SectionHeader = ({ label, icon, color, open, onToggle }) =>
    isOpen ? (
      <div
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 12px", cursor: "pointer", borderRadius: 10, marginBottom: 4,
          transition: "background 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color }}>
          {icon} {label}
        </div>
        {open ? <ChevronUp size={13} color={color} /> : <ChevronDown size={13} color={color} />}
      </div>
    ) : (
      <div style={{ height: 1, background: color, opacity: 0.2, margin: "10px 10px" }} />
    );

  return (
    <div style={{
      display: "flex", flexDirection: "column", flexShrink: 0, height: "100%",
      width: isOpen ? 280 : 68, overflow: "hidden",
      background: "linear-gradient(180deg,#0d0d1f 0%,#12122a 60%,#1a1040 100%)",
      borderRight: "1px solid rgba(124,58,237,0.15)",
      transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
      /* on mobile it becomes absolute */
      position: "relative", zIndex: 30,
    }}
    className="max-md:absolute max-md:top-0 max-md:left-0 max-md:h-full"
    >

      {/* Search bar */}
      {isOpen && (
        <div style={{ padding: "16px 16px 12px", flexShrink: 0, borderBottom: "1px solid rgba(124,58,237,0.12)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(124,58,237,0.2)",
            borderRadius: 12, padding: "10px 14px",
            transition: "border-color 0.2s",
          }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.55)"; }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.2)"; }}
          >
            <Search size={16} color="rgba(167,139,250,0.5)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: "transparent", border: "none", outline: "none",
                fontSize: 14, color: "#e0e0ff", width: "100%",
              }}
            />
          </div>
        </div>
      )}

      {/* Scrollable list */}
      <div style={{ flex: 1, overflowY: "auto", padding: isOpen ? "12px 10px" : "12px 6px" }}>

        {/* ── GROUPS ── */}
        <SectionHeader
          label="Groups" icon={<Hash size={13} />}
          color="rgba(167,139,250,0.85)" open={showGroups}
          onToggle={() => setShowGroups(v => !v)}
        />

        {(isOpen ? showGroups : true) && groupRooms.map(room => {
          const isActive = activeRoomId === room._id;
          return (
            <Row key={room._id.toString()} isActive={isActive} onClick={() => onSelectRoom(room)} tooltip={room.name || "Group"}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Avatar src={room.profileImage} name={room.name || "#"} />
                <Badge count={room.unreadCount} />
              </div>
              {isOpen && (
                <>
                  <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: "#f0f0ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {room.name || "Unnamed Group"}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(167,139,250,0.5)", marginTop: 2 }}>
                      {room.members?.length || 0} members
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); onEditGroup(room); }}
                    title="Edit group"
                    style={{
                      background: "transparent", border: "none", cursor: "pointer",
                      color: "rgba(167,139,250,0.3)", padding: "6px", borderRadius: 8,
                      display: "flex", flexShrink: 0, transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#a78bfa"; e.currentTarget.style.background = "rgba(124,58,237,0.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(167,139,250,0.3)"; e.currentTarget.style.background = "transparent"; }}
                  >
                    <Edit size={15} />
                  </button>
                </>
              )}
            </Row>
          );
        })}

        {isOpen && showGroups && groupRooms.length === 0 && (
          <div style={{ textAlign: "center", fontSize: 13, color: "rgba(167,139,250,0.3)", fontStyle: "italic", padding: "10px 8px" }}>
            No groups yet
          </div>
        )}

        {/* ── DIRECT MESSAGES ── */}
        <div style={{ marginTop: 8 }}>
          <SectionHeader
            label="Messages" icon={<MessageSquare size={13} />}
            color="rgba(103,232,249,0.85)" open={showDMs}
            onToggle={() => setShowDMs(v => !v)}
          />
        </div>

        {(isOpen ? showDMs : true) && privateChats.map(({ user, room }, idx) => {
          const status = onlineMap[user._id] || { status: "offline", lastSeen: usersMap[user._id]?.lastSeen };
          const isOnline = status.status === "online";
          const isActive = activeRoomId === room._id;
          return (
            <Row key={`${room._id}-${idx}`} isActive={isActive} onClick={() => onSelectRoom(room)} tooltip={user.nickName || "User"}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Avatar src={user.profileImage} name={user.nickName} />
                <StatusDot online={isOnline} />
                <Badge count={room.unreadCount} />
              </div>
              {isOpen && (
                <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#f0f0ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.nickName || "Unknown"}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 2, color: isOnline ? "#4ade80" : "rgba(103,232,249,0.35)" }}>
                    {isOnline ? "● Online" : status.lastSeen
                      ? `Last seen ${new Date(status.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                      : "Offline"}
                  </div>
                </div>
              )}
            </Row>
          );
        })}

        {isOpen && showDMs && privateChats.length === 0 && (
          <div style={{ textAlign: "center", fontSize: 13, color: "rgba(103,232,249,0.3)", fontStyle: "italic", padding: "10px 8px" }}>
            No direct messages yet
          </div>
        )}

        {/* ── ALL USERS ── */}
        <div style={{ marginTop: 8 }}>
          <SectionHeader
            label="All Users" icon={<Users size={13} />}
            color="rgba(249,168,212,0.85)" open={showUsers}
            onToggle={() => setShowUsers(v => !v)}
          />
        </div>

        {(isOpen ? showUsers : true) && filteredUsers.map((user, idx) => {
          const status = onlineMap[user._id] || { status: "offline" };
          const isOnline = status.status === "online";
          return (
            <Row key={`${user._id}-${idx}`} isActive={false} onClick={() => onSelectUser(user)} tooltip={user.nickName || "User"}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Avatar src={user.profileImage} name={user.nickName} />
                <StatusDot online={isOnline} />
              </div>
              {isOpen && (
                <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#f0f0ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.nickName || "Unknown"}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 2, color: isOnline ? "#4ade80" : "rgba(249,168,212,0.35)" }}>
                    {isOnline ? "● Online" : "Offline"}
                  </div>
                </div>
              )}
            </Row>
          );
        })}

        {isOpen && showUsers && filteredUsers.length === 0 && (
          <div style={{ textAlign: "center", fontSize: 13, color: "rgba(249,168,212,0.3)", fontStyle: "italic", padding: "10px 8px" }}>
            No users found
          </div>
        )}
      </div>

      {/* Bottom accent */}
      <div style={{ height: 3, flexShrink: 0, background: "linear-gradient(90deg,#7c3aed,#06b6d4,#ec4899)", opacity: 0.5 }} />
    </div>
  );
}
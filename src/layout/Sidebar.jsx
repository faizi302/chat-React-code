import React, { useState } from "react";
import { Edit, Search, ChevronDown, ChevronUp, Hash, MessageSquare, Users } from "lucide-react";

export default function Sidebar({ allUsers, onlineMap, usersMap, rooms = [], onSelectUser, onSelectRoom, activeRoomId, currentUserId, onEditGroup, isOpen }) {
  const [showGroups, setShowGroups] = useState(true);
  const [showDMs, setShowDMs]       = useState(true);
  const [showUsers, setShowUsers]   = useState(true);
  const [search, setSearch]         = useState("");

  const q = search.toLowerCase();
  const meStr = currentUserId?.toString() ?? "";

  const groupRooms = rooms.filter(r => r?.type === "group" && r.name?.toLowerCase().includes(q));

  const privateChats = rooms
    .filter(r => r?.type === "private" && r?.members?.length === 2)
    .map(room => {
      let otherId = null;
      for (const m of room.members) {
        const id = m?._id ? m._id.toString() : m?.toString?.() ?? m;
        if (id && id !== meStr) { otherId = id; break; }
      }
      if (!otherId) return null;
      const u = allUsers.find(u => u._id?.toString() === otherId)
        || (usersMap[otherId] ? { _id: otherId, nickName: usersMap[otherId].nickName || "Unknown", profileImage: usersMap[otherId].profileImage || "", lastSeen: usersMap[otherId].lastSeen } : null);
      if (!u) return null;
      return { user: u, room, lastActivity: room.lastActivity || room.createdAt };
    })
    .filter(Boolean)
    .filter(({ user }) => user.nickName?.toLowerCase().includes(q))
    .sort((a, b) => new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0));

  const filteredUsers = allUsers
    .filter(u => u?._id?.toString() !== meStr && (u.nickName || "").toLowerCase().includes(q));

  const Avatar = ({ src, name, size = 44 }) => src ? (
    <img src={src} alt={name} className="avatar" style={{ width: size, height: size }} />
  ) : (
    <div className="avatar-placeholder" style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}>
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );

  const StatusDot = ({ online }) => (
    <div className={`status-dot ${online ? "online" : "offline"}`} />
  );

  const Badge = ({ count }) => count ? (
    <div className="unread-badge">{count}</div>
  ) : null;

  const Row = ({ isActive, onClick, tooltip, children }) => (
    <div
      onClick={onClick}
      title={!isOpen ? tooltip : undefined}
      className={`sidebar-row ${isActive ? "active" : ""}`}
      style={{
        gap: isOpen ? 12 : 0,
        justifyContent: isOpen ? "flex-start" : "center",
        padding: isOpen ? "10px 12px" : "10px 0",
      }}
    >
      {children}
    </div>
  );

  const SectionHeader = ({ label, icon, color, open, onToggle }) => isOpen ? (
    <div className="sidebar-section-header" onClick={onToggle}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color }}>
        {icon} {label}
      </div>
      {open ? <ChevronUp size={13} color={color} /> : <ChevronDown size={13} color={color} />}
    </div>
  ) : (
    <div className="sidebar-divider" style={{ background: color }} />
  );

  return (
    // On mobile: hidden when closed (so chat fills full width), absolute overlay when open.
    // On desktop (md+): always visible as a collapsed icon-bar or full sidebar.
    <div
      className={`sidebar ${!isOpen ? "hidden md:flex" : ""}`}
      style={{ width: isOpen ? 280 : 68 }}
    >
      {isOpen && (
        <div className="sidebar-search">
          <div className="sidebar-search-box">
            <Search size={16} color="rgba(167,139,250,0.5)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="sidebar-search-input"
            />
          </div>
        </div>
      )}

      <div className="sidebar-list" style={{ padding: isOpen ? "12px 10px" : "12px 6px" }}>

        {/* Groups */}
        <SectionHeader label="Groups" icon={<Hash size={13} />} color="rgba(167,139,250,0.85)" open={showGroups} onToggle={() => setShowGroups(v => !v)} />
        {(isOpen ? showGroups : true) && groupRooms.map(room => (
          <Row key={room._id} isActive={activeRoomId === room._id} onClick={() => onSelectRoom(room)} tooltip={room.name}>
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
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(167,139,250,0.3)", padding: 6, borderRadius: 8, display: "flex", flexShrink: 0, transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#a78bfa"; e.currentTarget.style.background = "rgba(124,58,237,0.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(167,139,250,0.3)"; e.currentTarget.style.background = "transparent"; }}
                >
                  <Edit size={15} />
                </button>
              </>
            )}
          </Row>
        ))}
        {isOpen && showGroups && groupRooms.length === 0 && (
          <div className="sidebar-empty" style={{ color: "rgba(167,139,250,0.3)" }}>No groups yet</div>
        )}

        {/* DMs */}
        <div style={{ marginTop: 8 }}>
          <SectionHeader label="Messages" icon={<MessageSquare size={13} />} color="rgba(103,232,249,0.85)" open={showDMs} onToggle={() => setShowDMs(v => !v)} />
        </div>
        {(isOpen ? showDMs : true) && privateChats.map(({ user, room }, i) => {
          const status = onlineMap[user._id] || { status: "offline", lastSeen: usersMap[user._id]?.lastSeen };
          const online = status.status === "online";
          return (
            <Row key={`${room._id}-${i}`} isActive={activeRoomId === room._id} onClick={() => onSelectRoom(room)} tooltip={user.nickName}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Avatar src={user.profileImage} name={user.nickName} />
                <StatusDot online={online} />
                <Badge count={room.unreadCount} />
              </div>
              {isOpen && (
                <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#f0f0ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.nickName || "Unknown"}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 2, color: online ? "#4ade80" : "rgba(103,232,249,0.35)" }}>
                    {online
                      ? "● Online"
                      : status.lastSeen
                        ? `Last seen ${new Date(status.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        : "Offline"
                    }
                  </div>
                </div>
              )}
            </Row>
          );
        })}
        {isOpen && showDMs && privateChats.length === 0 && (
          <div className="sidebar-empty" style={{ color: "rgba(103,232,249,0.3)" }}>No direct messages yet</div>
        )}

        {/* All Users */}
        <div style={{ marginTop: 8 }}>
          <SectionHeader label="All Users" icon={<Users size={13} />} color="rgba(249,168,212,0.85)" open={showUsers} onToggle={() => setShowUsers(v => !v)} />
        </div>
        {(isOpen ? showUsers : true) && filteredUsers.map((user, i) => {
          const online = (onlineMap[user._id] || {}).status === "online";
          return (
            <Row key={`${user._id}-${i}`} isActive={false} onClick={() => onSelectUser(user)} tooltip={user.nickName}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Avatar src={user.profileImage} name={user.nickName} />
                <StatusDot online={online} />
              </div>
              {isOpen && (
                <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#f0f0ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.nickName || "Unknown"}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 2, color: online ? "#4ade80" : "rgba(249,168,212,0.35)" }}>
                    {online ? "● Online" : "Offline"}
                  </div>
                </div>
              )}
            </Row>
          );
        })}
        {isOpen && showUsers && filteredUsers.length === 0 && (
          <div className="sidebar-empty" style={{ color: "rgba(249,168,212,0.3)" }}>No users found</div>
        )}
      </div>

      <div className="sidebar-bottom" />
    </div>
  );
}
// layout/Header.jsx
import React, { useState , useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Plus, LogOut, Edit, Zap, ChevronDown, Shield } from "lucide-react";

export default function Header({
  currentUser,
  onJoinClick,
  onEditClick,
  onLogout,
  onToggleSidebar,
  sidebarOpen,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowMenu(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  return (
    <header
      style={{
        height: 64,
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        position: "relative",
        zIndex: 40,
        background: "linear-gradient(110deg, #0f0c29 0%, #1a1040 50%, #24243e 100%)",
        borderBottom: "1px solid rgba(124,58,237,0.2)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.5)",
      }}
    >
      {/* Bottom glow line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, #7c3aed, #06b6d4, #ec4899, #7c3aed)",
        opacity: 0.6,
      }} />

      {/* LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onToggleSidebar} style={iconBtn} title="Toggle sidebar">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(124,58,237,0.5)", flexShrink: 0,
          }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{
            fontWeight: 800, fontSize: 18,
            background: "linear-gradient(90deg,#a78bfa,#67e8f9)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
            fontFamily: "'DM Sans', sans-serif",
          }} className="hidden sm:block">
            StandardChat
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* New group button */}
        <button
          onClick={onJoinClick}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 10, cursor: "pointer",
            background: "rgba(124,58,237,0.18)",
            border: "1px solid rgba(124,58,237,0.35)",
            color: "#a78bfa", fontSize: 13, fontWeight: 600,
            transition: "all 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.32)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(124,58,237,0.18)"}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Group</span>
        </button>

        {/* User avatar / dropdown */}
        {currentUser && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowMenu(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "5px 10px", borderRadius: 10, cursor: "pointer",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(124,58,237,0.2)",
                transition: "all 0.2s",
              }}
            >
              {currentUser.profileImage ? (
                <img
                  src={currentUser.profileImage}
                  alt={currentUser.nickName || currentUser.name}
                  style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(124,58,237,0.5)", flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 14, color: "white", flexShrink: 0,
                }}>
                  {(currentUser.nickName || currentUser.name)?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <span className="hidden sm:block" style={{ fontSize: 13, fontWeight: 500, color: "#e0e0ff", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentUser.nickName || currentUser.name}
              </span>
              {currentUser.role === "admin" && (
                <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 4, background: "rgba(236,72,153,0.2)", color: "#f9a8d4", fontWeight: 700, border: "1px solid rgba(236,72,153,0.3)" }}>
                  ADMIN
                </span>
              )}
              <ChevronDown size={13} color="rgba(167,139,250,0.6)" />
            </button>

            {showMenu && (
              <div ref={menuRef} style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                background: "#181830", border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: 14, boxShadow: "0 16px 50px rgba(0,0,0,0.6)",
                width: 190, overflow: "hidden", zIndex: 100,
              }}>
                <MenuItem icon={<Edit size={15} color="#a78bfa" />} label="Edit Profile" onClick={() => { onEditClick(); setShowMenu(false); }} />
                {currentUser.role === "admin" && (
                  <>
                    <div style={{ height: 1, background: "rgba(124,58,237,0.12)", margin: "0 12px" }} />
                    <MenuItem
                      icon={<Shield size={15} color="#f9a8d4" />}
                      label="Admin Dashboard"
                      onClick={() => { navigate("/admin"); setShowMenu(false); }}
                      color="#f9a8d4"
                    />
                  </>
                )}
                <div style={{ height: 1, background: "rgba(124,58,237,0.12)", margin: "0 12px" }} />
                <MenuItem icon={<LogOut size={15} />} label="Logout" onClick={() => { onLogout(); setShowMenu(false); }} color="#fb7185" />
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function MenuItem({ icon, label, onClick, color = "#e0e0ff" }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "12px 16px",
        background: "none", border: "none", cursor: "pointer",
        color, fontSize: 13, fontWeight: 500,
        transition: "background 0.15s", textAlign: "left",
        fontFamily: "'DM Sans', sans-serif",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.12)"}
      onMouseLeave={e => e.currentTarget.style.background = "none"}
    >
      {icon} {label}
    </button>
  );
}

const iconBtn = {
  width: 38, height: 38, borderRadius: 10, cursor: "pointer",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(124,58,237,0.2)",
  color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center",
  transition: "all 0.2s",
};
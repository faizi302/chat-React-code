import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Plus, LogOut, Edit, ChevronDown, Shield } from "lucide-react";
import logo from "../assets/mk logo.png";

export default function Header({ currentUser, onJoinClick, onEditClick, onLogout, onToggleSidebar, sidebarOpen }) {
  const [showMenu, setShowMenu]         = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate  = useNavigate();
  const menuRef   = useRef(null);
  const mobileRef = useRef(null);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const h = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    const h = e => {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) setShowMobileMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const isAdmin = currentUser?.role === "admin";

  return (
    <header className="header">
      <div className="header-glow" />

      {/* Left: sidebar toggle + logo */}
      <div className="header-left">
        <button onClick={onToggleSidebar} className="icon-btn" aria-label="Toggle sidebar">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <img
          src={logo}
          alt="Logo"
          style={{ height: 36, width: "auto", objectFit: "contain" }}
        />
      </div>

      {/* Right — desktop: full controls */}
      <div className="header-right">

        {/* New Group — desktop only, admin only */}
        {isAdmin && (
          <button onClick={onJoinClick} className="btn-new-group desktopNav">
            <Plus size={16} />
            <span>New Group</span>
          </button>
        )}

        {/* Desktop user menu */}
        {currentUser && (
          <div style={{ position: "relative" }} className="desktopNav" ref={menuRef}>
            <button onClick={() => setShowMenu(v => !v)} className="user-menu-btn">
              {currentUser.profileImage
                ? <img src={currentUser.profileImage} alt={currentUser.nickName || currentUser.name} className="avatar-sm" />
                : <div className="avatar-fallback">{(currentUser.nickName || currentUser.name)?.[0]?.toUpperCase() || "?"}</div>
              }
              <span style={{ fontSize: 13, fontWeight: 500, color: "#e0e0ff", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentUser.nickName || currentUser.name}
              </span>
              {isAdmin && <span className="badge-admin">ADMIN</span>}
              <ChevronDown size={13} color="rgba(167,139,250,0.6)" />
            </button>

            {showMenu && (
              <div className="dropdown-menu">
                <button className="dropdown-item" style={{ color: "#e0e0ff" }}
                  onClick={() => { onEditClick(); setShowMenu(false); }}>
                  <Edit size={15} color="#a78bfa" /> Edit Profile
                </button>
                {isAdmin && (
                  <>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item" style={{ color: "#f9a8d4" }}
                      onClick={() => { navigate("/admin"); setShowMenu(false); }}>
                      <Shield size={15} color="#f9a8d4" /> Admin Dashboard
                    </button>
                  </>
                )}
                <div className="dropdown-divider" />
                <button className="dropdown-item" style={{ color: "#fb7185" }}
                  onClick={() => { onLogout(); setShowMenu(false); }}>
                  <LogOut size={15} /> Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile hamburger (3 dots / menu icon) */}
        {currentUser && (
          <div style={{ position: "relative" }} className="mobileMenuBtn" ref={mobileRef}>
            <button
              onClick={() => setShowMobileMenu(v => !v)}
              className="user-menu-btn"
              aria-label="Open menu"
              style={{ gap: 6, padding: "5px 8px" }}
            >
              {currentUser.profileImage
                ? <img src={currentUser.profileImage} alt={currentUser.nickName || currentUser.name} className="avatar-sm" />
                : <div className="avatar-fallback">{(currentUser.nickName || currentUser.name)?.[0]?.toUpperCase() || "?"}</div>
              }
              {showMobileMenu ? <X size={16} color="#a78bfa" /> : <ChevronDown size={16} color="#a78bfa" />}
            </button>

            {showMobileMenu && (
              <>
                {/* Overlay to close on outside tap */}
                <div
                  style={{
                    position: "fixed", inset: 0, zIndex: 48,
                  }}
                  onClick={() => setShowMobileMenu(false)}
                />
                {/* Dropdown */}
                <div className="dropdown-menu" style={{ zIndex: 49, minWidth: 210 }}>
                  {/* User info row */}
                  <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid rgba(124,58,237,0.12)" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {currentUser.nickName || currentUser.name}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(167,139,250,0.5)", marginTop: 2 }}>
                      {currentUser.email || ""}
                    </div>
                    {isAdmin && <span className="badge-admin" style={{ marginTop: 4, display: "inline-block" }}>ADMIN</span>}
                  </div>

                  {/* New Group — mobile only, admin only */}
                  {isAdmin && (
                    <button className="dropdown-item" style={{ color: "#a78bfa" }}
                      onClick={() => { onJoinClick(); setShowMobileMenu(false); }}>
                      <Plus size={15} color="#a78bfa" /> New Group
                    </button>
                  )}

                  <button className="dropdown-item" style={{ color: "#e0e0ff" }}
                    onClick={() => { onEditClick(); setShowMobileMenu(false); }}>
                    <Edit size={15} color="#a78bfa" /> Edit Profile
                  </button>

                  {isAdmin && (
                    <>
                      <div className="dropdown-divider" />
                      <button className="dropdown-item" style={{ color: "#f9a8d4" }}
                        onClick={() => { navigate("/admin"); setShowMobileMenu(false); }}>
                        <Shield size={15} color="#f9a8d4" /> Admin Dashboard
                      </button>
                    </>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" style={{ color: "#fb7185" }}
                    onClick={() => { onLogout(); setShowMobileMenu(false); }}>
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
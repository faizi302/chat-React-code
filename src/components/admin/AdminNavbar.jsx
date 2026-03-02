// src/components/admin/AdminNavbar.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import AdminAvatar from "./AdminAvatar.jsx";
import logo from "../assets/mk logo.png";

export default function AdminNavbar() {
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const menuRef = useRef(null);
    const mobileRef = useRef(null);

    const goBack = () => navigate("/");
    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    // Close desktop dropdown on outside click
    useEffect(() => {
        const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    // Close mobile menu on outside click
    useEffect(() => {
        const h = e => { if (mobileRef.current && !mobileRef.current.contains(e.target)) setShowMobileMenu(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    return (
        <div style={{
            background: "linear-gradient(110deg,#0f0c29,#1a1040,#24243e)",
            borderBottom: "1px solid rgba(124,58,237,0.2)",
            padding: "0 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            height: 64,
            position: "relative",
            fontFamily: "'DM Sans', sans-serif",
            flexShrink: 0,
        }}>

            <div className="flex">
                {/* Logo */}
                <img
                    src={logo}
                    alt="Logo"
                    style={{ height: 36, width: "auto", objectFit: "contain" }}
                />


            </div>

            {/* Right side controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>

                {/* Desktop controls */}
                <div className="desktopNav" style={{ gap: 10 }}>

                    {/* Admin profile button */}
                    {currentUser && (
                        <div style={{ position: "relative" }} ref={menuRef}>
                            <button
                                onClick={() => setShowMenu(v => !v)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "5px 10px", borderRadius: 10, cursor: "pointer",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(124,58,237,0.2)", transition: "all 0.2s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.15)"}
                                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                            >
                                <AdminAvatar
                                    src={currentUser.profileImage}
                                    name={currentUser.nickName || currentUser.name}
                                    size={30}
                                />
                                <span style={{ fontSize: 13, fontWeight: 500, color: "#e0e0ff", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {currentUser.nickName || currentUser.name}
                                </span>
                                <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 4, background: "rgba(236,72,153,0.2)", color: "#f9a8d4", fontWeight: 700, border: "1px solid rgba(236,72,153,0.3)" }}>
                                    ADMIN
                                </span>
                                <ChevronDown size={12} color="rgba(167,139,250,0.6)" />
                            </button>

                            {showMenu && (
                                <div style={{
                                    position: "absolute", right: 0, top: "calc(100% + 8px)",
                                    background: "#181830", border: "1px solid rgba(124,58,237,0.3)",
                                    borderRadius: 14, boxShadow: "0 16px 50px rgba(0,0,0,0.6)",
                                    width: 190, overflow: "hidden", zIndex: 100,
                                }}>
                                    <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid rgba(124,58,237,0.12)" }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0ff" }}>{currentUser.nickName || currentUser.name}</div>
                                        <div style={{ fontSize: 11, color: "rgba(167,139,250,0.5)", marginTop: 2 }}>{currentUser.email || ""}</div>
                                    </div>
                                    <button
                                        onClick={() => { goBack(); setShowMenu(false); }}
                                        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#a78bfa", fontFamily: "'DM Sans',sans-serif" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.12)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                                    >
                                        <ArrowLeft size={14} /> Back to Chat
                                    </button>
                                    <div style={{ height: 1, background: "rgba(124,58,237,0.12)", margin: "0 12px" }} />
                                    <button
                                        onClick={() => { handleLogout(); setShowMenu(false); }}
                                        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#fb7185", fontFamily: "'DM Sans',sans-serif" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(244,63,94,0.08)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                                    >
                                        <LogOut size={14} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile hamburger */}
                <div className="mobileMenuBtn" style={{ position: "relative" }} ref={mobileRef}>
                    <button
                        onClick={() => setShowMobileMenu(v => !v)}
                        style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "5px 8px", borderRadius: 10, cursor: "pointer",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(124,58,237,0.2)",
                        }}
                    >
                        {currentUser?.profileImage
                            ? <img src={currentUser.profileImage} alt="" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(124,58,237,0.5)" }} />
                            : <AdminAvatar src={currentUser?.profileImage} name={currentUser?.nickName || currentUser?.name} size={30} />
                        }
                        {showMobileMenu ? <X size={16} color="#a78bfa" /> : <Menu size={16} color="#a78bfa" />}
                    </button>

                    {showMobileMenu && (
                        <>
                            <div
                                style={{ position: "fixed", inset: 0, zIndex: 48 }}
                                onClick={() => setShowMobileMenu(false)}
                            />
                            <div style={{
                                position: "absolute", right: 0, top: "calc(100% + 8px)",
                                background: "#181830", border: "1px solid rgba(124,58,237,0.3)",
                                borderRadius: 14, boxShadow: "0 16px 50px rgba(0,0,0,0.6)",
                                width: 210, overflow: "hidden", zIndex: 49,
                            }}>
                                {currentUser && (
                                    <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid rgba(124,58,237,0.12)" }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0ff" }}>{currentUser.nickName || currentUser.name}</div>
                                        <div style={{ fontSize: 11, color: "rgba(167,139,250,0.5)", marginTop: 2 }}>{currentUser.email || ""}</div>
                                        <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 4, background: "rgba(236,72,153,0.2)", color: "#f9a8d4", fontWeight: 700, border: "1px solid rgba(236,72,153,0.3)", marginTop: 4, display: "inline-block" }}>ADMIN</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => { goBack(); setShowMobileMenu(false); }}
                                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#a78bfa", fontFamily: "'DM Sans',sans-serif" }}
                                >
                                    <ArrowLeft size={14} /> Back to Chat
                                </button>
                                <div style={{ height: 1, background: "rgba(124,58,237,0.12)", margin: "0 12px" }} />
                                <button
                                    onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#fb7185", fontFamily: "'DM Sans',sans-serif" }}
                                >
                                    <LogOut size={14} /> Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
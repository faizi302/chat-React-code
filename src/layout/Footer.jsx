import React from "react";
import { ShieldCheck, Wifi, Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#4ade80", fontSize: 14, fontWeight: 600 }}>
        <ShieldCheck size={15} />
        <span className="hidden sm:inline">End-to-End Secure</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Zap size={13} style={{ color: "rgba(167,139,250,0.6)" }} />
        <span style={{ fontWeight: 800, background: "linear-gradient(90deg,#c4b5fd,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 1 }}>
          StandardChat
        </span>
        <span style={{ fontSize: 12, color: "rgba(167,139,250,0.3)" }}>© {new Date().getFullYear()}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Wifi size={14} style={{ color: "rgba(103,232,249,0.6)" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", animation: "pulse 2s infinite" }} />
        <span className="hidden sm:inline" style={{ fontSize: 13, color: "rgba(103,232,249,0.6)", fontWeight: 500 }}>Live</span>
      </div>
    </footer>
  );
}
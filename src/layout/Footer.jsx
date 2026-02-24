import React from "react";
import { ShieldCheck, Wifi, Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="h-11 flex-shrink-0 bg-gradient-to-r from-[#0f0c29] via-[#1a1040] to-[#0f0c29] border-t border-purple-900/15 flex items-center justify-between px-6 relative z-10">
      {/* Glow line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-500 opacity-55" />

      <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
        <ShieldCheck size={15} />
        <span className="hidden sm:inline">End-to-End Secure</span>
      </div>

      <div className="flex items-center gap-2">
        <Zap size={13} className="text-purple-300/60" />
        <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300 tracking-wide">
          StandardChat
        </span>
        <span className="text-xs text-purple-300/30">
          © {new Date().getFullYear()}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Wifi size={14} className="text-cyan-300/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
        <span className="text-sm text-cyan-300/60 font-medium hidden sm:inline">Live</span>
      </div>
    </footer>
  );
}
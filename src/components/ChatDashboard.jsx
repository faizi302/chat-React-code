// ChatDashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import Message from "./Message";
import {
  Send, Hash, MessageSquare, Paperclip, Zap,
  Users, DoorOpen, Edit, Trash2, Shield, ShieldOff,
  MessageSquareOff, MessageSquareText, MoreVertical, X,
} from "lucide-react";
import { uploadFile } from "../api/api";

const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const ratio = img.width / img.height;
      canvas.width = maxWidth;
      canvas.height = maxWidth / ratio;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        resolve(new File([blob], file.name, { type: file.type }));
      }, file.type, quality);
    };
    img.onerror = reject;
  });
};

export default function ChatDashboard({
  activeRoom,
  messages,
  currentUser,
  socket,
  typingUsers,
  usersMap,
  onlineMap,
  onRequestReaders,
  onAddReaction,
  // Group action callbacks (from App.jsx)
  onShowMembers,
  onLeaveGroup,
  onEditGroup,
  onDeleteGroup,
  onClearChat,
  onToggleAdminOnly,
}) {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [sendError, setSendError] = useState("");
  const scrollRef = useRef();
  const typingTimeout = useRef();
  const fileInputRef = useRef();
  const groupMenuRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeRoom) return;
    if (text && !isTyping) {
      socket?.emit("typing_start", { roomId: activeRoom._id });
      setIsTyping(true);
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      if (isTyping) {
        socket?.emit("typing_stop", { roomId: activeRoom._id });
        setIsTyping(false);
      }
    }, 2000);
    return () => clearTimeout(typingTimeout.current);
  }, [text, isTyping, activeRoom?._id, socket]);

  // Close group menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (groupMenuRef.current && !groupMenuRef.current.contains(e.target)) {
        setShowGroupMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Listen for send errors from socket
  useEffect(() => {
    if (!socket) return;
    const handleSendError = ({ message }) => {
      setSendError(message);
      setTimeout(() => setSendError(""), 3000);
    };
    socket.on("send_error", handleSendError);
    return () => socket.off("send_error", handleSendError);
  }, [socket]);

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    let compressed = file;
    if (file.type.startsWith("image/")) {
      try { compressed = await compressImage(file); } catch (err) { console.error("Compression failed:", err); }
    }
    try {
      const result = await uploadFile(compressed);
      if (!result?.url) throw new Error("Upload failed");
      let mediaType = "file";
      if (file.type.startsWith("image/")) mediaType = "image";
      if (file.type.startsWith("video/")) mediaType = "video";
      sendMessage(mediaType, result.url, file.name || "");
    } catch (err) {
      console.error("File upload error:", err);
      alert("Failed to upload file. Please try again.");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = (mediaType = "text", mediaUrl = "", caption = "") => {
    if (mediaType === "text" && !text.trim()) return;
    try {
      socket?.emit("send_message", {
        roomId: activeRoom._id,
        content: mediaType === "text" ? text : caption,
        senderId: currentUser._id,
        mediaType, mediaUrl,
        repliedTo: replyingTo?._id,
      });
      setText("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Send message error:", err);
      alert("Failed to send message.");
    }
  };

  const typingText = typingUsers
    .filter(id => id !== currentUser._id)
    .map(id => usersMap[id]?.nickName)
    .filter(Boolean)
    .join(", ");

  // Determine current user's role in the group
  const isAppAdmin = currentUser?.role === "admin";
  const isMainAdmin = activeRoom?.mainAdmin === currentUser?._id ||
    activeRoom?.mainAdmin?._id === currentUser?._id ||
    activeRoom?.mainAdmin?.toString() === currentUser?._id;
  const isGroupAdmin = isMainAdmin ||
    activeRoom?.groupAdmins?.some(a =>
      (a._id || a)?.toString() === currentUser?._id
    );
  const canManageGroup = isAppAdmin || isGroupAdmin;
  const canDeleteGroup = isAppAdmin || isMainAdmin;
  const canSend = !activeRoom?.onlyAdminCanSend || isGroupAdmin || isAppAdmin;
  const isMember = activeRoom?.members?.some(m =>
    (m._id || m)?.toString() === currentUser?._id
  );

  /* ── No room selected ── */
  if (!activeRoom) {
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 20,
        background: "#09091a",
      }}>
        <div style={{
          width: 90, height: 90, borderRadius: 24,
          background: "rgba(24,24,48,1)",
          border: "1px solid rgba(124,58,237,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 40px rgba(124,58,237,0.2)",
        }}>
          <Zap size={40} color="#7c3aed" />
        </div>
        <div style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24,
          background: "linear-gradient(90deg,#a78bfa,#67e8f9)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Start Chatting
        </div>
        <div style={{ fontSize: 15, color: "rgba(167,139,250,0.4)" }}>
          Select a conversation or create a new group
        </div>
      </div>
    );
  }

  const isGroup = activeRoom.type === "group";

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", background: "#09091a" }}>

      {/* ── Chat topbar with group actions ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "0 16px", flexShrink: 0, height: 60,
        background: "rgba(13,13,31,0.98)",
        borderBottom: "1px solid rgba(124,58,237,0.15)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}>
        {/* Room icon + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          {isGroup ? <Hash size={18} color="#a78bfa" /> : <MessageSquare size={18} color="#67e8f9" />}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#f0f0ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {activeRoom.name ||
                activeRoom.members?.find(m => (m._id || m) !== currentUser?._id)?.nickName ||
                "Chat"}
            </div>
            {isGroup && (
              <div style={{ fontSize: 11, color: "rgba(167,139,250,0.45)", display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
                <span>{activeRoom.memberCount || activeRoom.members?.length || 0} members</span>
                {activeRoom.onlyAdminCanSend && (
                  <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: "rgba(251,113,133,0.15)", color: "#fb7185", border: "1px solid rgba(251,113,133,0.25)", fontWeight: 700 }}>
                    🔒 Admin only
                  </span>
                )}
                {isMainAdmin && (
                  <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: "rgba(236,72,153,0.15)", color: "#f9a8d4", border: "1px solid rgba(236,72,153,0.25)", fontWeight: 700 }}>
                    👑 Main Admin
                  </span>
                )}
                {!isMainAdmin && isGroupAdmin && !isAppAdmin && (
                  <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.25)", fontWeight: 700 }}>
                    🛡 Admin
                  </span>
                )}
                {isAppAdmin && (
                  <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: "rgba(6,182,212,0.15)", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.25)", fontWeight: 700 }}>
                    ⚡ App Admin
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Group action buttons */}
        {isGroup && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {/* Members button */}
            <button
              onClick={onShowMembers}
              title="View members"
              style={topbarBtn("#a78bfa", "rgba(124,58,237,0.12)")}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.25)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(124,58,237,0.12)"}
            >
              <Users size={16} />
              <span className="hidden sm:inline" style={{ fontSize: 12, fontWeight: 600 }}>Members</span>
            </button>

            {/* Edit group (admins only) */}
            {canManageGroup && (
              <button
                onClick={onEditGroup}
                title="Edit group"
                style={topbarBtn("#67e8f9", "rgba(6,182,212,0.1)")}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(6,182,212,0.22)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(6,182,212,0.1)"}
              >
                <Edit size={15} />
                <span className="hidden md:inline" style={{ fontSize: 12, fontWeight: 600 }}>Edit</span>
              </button>
            )}

            {/* More menu */}
            <div style={{ position: "relative" }} ref={groupMenuRef}>
              <button
                onClick={() => setShowGroupMenu(v => !v)}
                title="More options"
                style={topbarBtn("rgba(167,139,250,0.7)", "rgba(255,255,255,0.05)")}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              >
                <MoreVertical size={16} />
              </button>

              {showGroupMenu && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 6px)",
                  background: "#181830",
                  border: "1px solid rgba(124,58,237,0.3)",
                  borderRadius: 14, boxShadow: "0 16px 50px rgba(0,0,0,0.7)",
                  width: 210, overflow: "hidden", zIndex: 200,
                }}>
                  {/* Toggle Admin Only Send */}
                  {canManageGroup && (
                    <GroupMenuItem
                      icon={activeRoom.onlyAdminCanSend ? <MessageSquareText size={15} /> : <MessageSquareOff size={15} />}
                      label={activeRoom.onlyAdminCanSend ? "Allow All to Send" : "Admin-Only Send"}
                      color={activeRoom.onlyAdminCanSend ? "#4ade80" : "#fb7185"}
                      onClick={() => { onToggleAdminOnly(); setShowGroupMenu(false); }}
                    />
                  )}

                  {/* Clear Chat */}
                  {(canManageGroup) && (
                    <GroupMenuItem
                      icon={<Trash2 size={15} />}
                      label="Clear Chat"
                      color="#fb7185"
                      onClick={() => { onClearChat(); setShowGroupMenu(false); }}
                    />
                  )}

                  {/* Leave Group (members who aren't main admin, and non-app-admins) */}
                  {isMember && !isAppAdmin && (
                    <>
                      <div style={{ height: 1, background: "rgba(124,58,237,0.12)", margin: "0 12px" }} />
                      <GroupMenuItem
                        icon={<DoorOpen size={15} />}
                        label="Leave Group"
                        color="#f97316"
                        onClick={() => { onLeaveGroup(); setShowGroupMenu(false); }}
                      />
                    </>
                  )}

                  {/* Delete Group (main admin or app admin) */}
                  {canDeleteGroup && (
                    <>
                      <div style={{ height: 1, background: "rgba(124,58,237,0.12)", margin: "0 12px" }} />
                      <GroupMenuItem
                        icon={<Trash2 size={15} />}
                        label="Delete Group"
                        color="#ef4444"
                        onClick={() => { onDeleteGroup(); setShowGroupMenu(false); }}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
        {messages.map((m, i) => (
          <Message
            key={i}
            message={m}
            currentUser={currentUser}
            usersMap={usersMap}
            isGroup={isGroup}
            onRequestReaders={onRequestReaders}
            onReply={msg => setReplyingTo(msg)}
            onAddReaction={onAddReaction}
          />
        ))}
        <div ref={scrollRef} />
      </div>

      {/* ── Input area ── */}
      <div style={{
        flexShrink: 0,
        padding: "14px 20px 18px",
        background: "rgba(9,9,26,0.97)",
        borderTop: "1px solid rgba(124,58,237,0.12)",
      }}>
        {/* Send error */}
        {sendError && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)",
            borderRadius: 10, padding: "8px 14px", marginBottom: 10,
            fontSize: 13, color: "#fb7185",
          }}>
            <span>🔒 {sendError}</span>
            <button onClick={() => setSendError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#fb7185" }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Typing indicator */}
        {typingText && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 13, color: "#a78bfa", marginBottom: 10,
          }}>
            {typingText} is typing…
          </div>
        )}

        {/* Reply bar */}
        {replyingTo && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(24,24,48,1)",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: 12, padding: "10px 16px", marginBottom: 10,
          }}>
            <span style={{ fontSize: 13, color: "rgba(167,139,250,0.6)" }}>
              Replying to:{" "}
              <span style={{ color: "#f0f0ff" }}>
                {replyingTo.content?.substring(0, 55)}…
              </span>
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              style={{ background: "none", border: "none", color: "#fb7185", fontSize: 18, cursor: "pointer", lineHeight: 1, paddingLeft: 10 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Admin-only send banner for non-admins */}
        {isGroup && activeRoom.onlyAdminCanSend && !canSend && (
          <div style={{
            textAlign: "center", fontSize: 13, color: "rgba(251,113,133,0.6)",
            padding: "12px", background: "rgba(244,63,94,0.05)",
            border: "1px solid rgba(244,63,94,0.15)", borderRadius: 12,
          }}>
            🔒 Only admins can send messages in this group
          </div>
        )}

        {/* Input row */}
        {canSend && (
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(24,24,48,1)",
            border: "1px solid rgba(124,58,237,0.2)",
            borderRadius: 18, padding: "10px 16px",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.55)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(124,58,237,0.1)"; }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              title="Attach file"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(167,139,250,0.45)", flexShrink: 0, padding: 4,
                display: "flex", alignItems: "center", transition: "color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#a78bfa"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(167,139,250,0.45)"; }}
            >
              {uploading ? <span className="spinner" /> : <Paperclip size={20} />}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*,*/*" className="file-input" />

            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Type a message…"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                fontSize: 15, color: "#f0f0ff",
              }}
            />

            <button
              onClick={() => sendMessage()}
              disabled={!text.trim()}
              title="Send"
              style={{
                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                background: text.trim()
                  ? "linear-gradient(135deg,#7c3aed,#4f46e5)"
                  : "rgba(124,58,237,0.15)",
                border: "none", cursor: text.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", transition: "all 0.2s",
                boxShadow: text.trim() ? "0 2px 14px rgba(124,58,237,0.5)" : "none",
              }}
              onMouseEnter={e => { if (text.trim()) { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 4px 22px rgba(124,58,237,0.65)"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = text.trim() ? "0 2px 14px rgba(124,58,237,0.5)" : "none"; }}
            >
              <Send size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GroupMenuItem({ icon, label, color = "#e0e0ff", onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "11px 16px",
        background: "none", border: "none", cursor: "pointer",
        color, fontSize: 13, fontWeight: 500,
        transition: "background 0.15s", textAlign: "left",
        fontFamily: "'DM Sans', sans-serif",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.1)"}
      onMouseLeave={e => e.currentTarget.style.background = "none"}
    >
      {icon} {label}
    </button>
  );
}

const topbarBtn = (color, bg) => ({
  display: "flex", alignItems: "center", gap: 6,
  padding: "7px 12px", borderRadius: 9, cursor: "pointer",
  background: bg,
  border: `1px solid ${color}30`,
  color: color, transition: "all 0.15s",
});
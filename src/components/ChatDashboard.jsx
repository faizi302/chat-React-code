import React, { useState, useRef, useEffect } from "react";
import Message from "./Message";
import { Send, Hash, MessageSquare, Paperclip, Zap, Users, DoorOpen, Edit, Trash2, MessageSquareOff, MessageSquareText, MoreVertical, X, Image, File, Crop, RotateCcw } from "lucide-react";
import { uploadFile } from "../api/api";

/* ── helpers ── */
function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

async function compressImage(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = img.height / img.width;
      canvas.width = Math.min(maxWidth, img.width);
      canvas.height = canvas.width * ratio;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => resolve(new File([blob], file.name, { type: file.type })), file.type, quality);
    };
    img.onerror = reject;
  });
}

async function getCroppedBlob(imgEl, crop, fileName, fileType) {
  return new Promise(resolve => {
    const sx = imgEl.naturalWidth / imgEl.width;
    const sy = imgEl.naturalHeight / imgEl.height;
    const canvas = document.createElement("canvas");
    canvas.width = crop.width * sx;
    canvas.height = crop.height * sy;
    canvas.getContext("2d").drawImage(imgEl, crop.x * sx, crop.y * sy, crop.width * sx, crop.height * sy, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => resolve(new File([blob], fileName, { type: fileType })), fileType, 0.92);
  });
}

/* ── Attach Popover (opens above the paperclip button) ── */
function AttachPopover({ onSelectMedia, onSelectFile, onClose }) {
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const items = [
    {
      icon: <Image size={22} color="#a78bfa" />,
      label: "Photo / Video",
      desc: "Images, GIFs, videos",
      onClick: onSelectMedia,
    },
    {
      icon: <File size={22} color="#67e8f9" />,
      label: "File",
      desc: "PDF, ZIP, any file",
      onClick: onSelectFile,
    },
  ];

  return (
    <div
      ref={ref}
      className="attach-popover"
      role="menu"
    >
      {items.map(({ icon, label, desc, onClick }) => (
        <button
          key={label}
          className="attach-pop-btn"
          onClick={onClick}
          role="menuitem"
        >
          <div className="attach-pop-icon">{icon}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#f0f0ff", textAlign: "center" }}>{label}</div>
          <div style={{ fontSize: 10, color: "rgba(167,139,250,0.45)", textAlign: "center", marginTop: 1 }}>{desc}</div>
        </button>
      ))}
    </div>
  );
}

/* ── Image preview + crop ── */
function ImagePreviewModal({ file, onSend, onCancel, sending }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [crop, setCrop] = useState(null);
  const [cropping, setCropping] = useState(false);
  const [caption, setCaption] = useState("");
  const imgRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onMouseDown = e => {
    if (!cropping) return;
    const rect = imgRef.current.getBoundingClientRect();
    startRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setCrop({ x: startRef.current.x, y: startRef.current.y, width: 0, height: 0 });
  };
  const onMouseMove = e => {
    if (!cropping || !startRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const cx = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const cy = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const sx = startRef.current.x, sy = startRef.current.y;
    setCrop({ x: Math.min(cx, sx), y: Math.min(cy, sy), width: Math.abs(cx - sx), height: Math.abs(cy - sy) });
  };
  const onMouseUp = () => { startRef.current = null; };

  const handleSend = async () => {
    let f = file;
    if (crop && crop.width > 10 && crop.height > 10 && imgRef.current)
      f = await getCroppedBlob(imgRef.current, crop, file.name, file.type);
    onSend(f, caption);
  };

  return (
    <div className="preview-modal-backdrop">
      <div className="preview-modal-card">
        <div className="preview-header">
          <span style={{ fontSize: 15, fontWeight: 700, color: "#f0f0ff" }}>Preview</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`crop-btn ${cropping ? "active" : "inactive"}`} onClick={() => { setCropping(v => !v); setCrop(null); }}>
              <Crop size={14} /> Crop
            </button>
            {crop && (
              <button className="reset-btn" onClick={() => { setCrop(null); setCropping(false); }}>
                <RotateCcw size={14} />
              </button>
            )}
            <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(167,139,250,0.5)", display: "flex" }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="preview-img-area">
          {previewUrl && (
            <div style={{ position: "relative", display: "inline-block", lineHeight: 0 }}>
              <img ref={imgRef} src={previewUrl} alt="preview" draggable={false}
                style={{ maxWidth: "100%", maxHeight: "52vh", borderRadius: 12, display: "block", userSelect: "none", cursor: cropping ? "crosshair" : "default" }}
                onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
              />
              {crop && crop.width > 2 && crop.height > 2 && (
                <div style={{ position: "absolute", left: crop.x, top: crop.y, width: crop.width, height: crop.height, border: "2px solid #a78bfa", background: "rgba(167,139,250,0.1)", pointerEvents: "none", boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)" }} />
              )}
            </div>
          )}
        </div>
        {cropping && <div style={{ textAlign: "center", fontSize: 12, color: "rgba(167,139,250,0.5)", paddingBottom: 6 }}>Drag on image to select crop area</div>}

        <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(124,58,237,0.1)" }}>
          <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Add a caption…" className="caption-input" />
        </div>
        <div className="btn-row" style={{ padding: "12px 16px 20px" }}>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" style={{ flex: 2 }} onClick={handleSend} disabled={sending}>
            {sending ? <><div className="spinner" /> Sending…</> : <><Send size={16} /> Send</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── File preview ── */
function FilePreviewModal({ file, onSend, onCancel, sending }) {
  const [caption, setCaption] = useState("");
  const ext = (file.name || "").split(".").pop().toUpperCase();
  return (
    <div className="preview-modal-backdrop">
      <div className="preview-modal-card" style={{ width: "min(420px,96vw)" }}>
        <div className="preview-header">
          <span style={{ fontSize: 15, fontWeight: 700, color: "#f0f0ff" }}>Send File</span>
          <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(167,139,250,0.5)", display: "flex" }}><X size={20} /></button>
        </div>
        <div style={{ padding: "20px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 14, padding: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <File size={22} color="#a78bfa" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
              <div style={{ fontSize: 12, color: "rgba(167,139,250,0.5)", marginTop: 2 }}>{ext} · {formatFileSize(file.size)}</div>
            </div>
          </div>
          <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Add a caption…" className="caption-input" style={{ marginTop: 14 }} />
        </div>
        <div className="btn-row" style={{ padding: "0 18px 20px" }}>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" style={{ flex: 2 }} onClick={() => onSend(file, caption)} disabled={sending}>
            {sending ? <><div className="spinner" /> Sending…</> : <><Send size={16} /> Send</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Auto-grow textarea ── */
function AutoTextarea({ value, onChange, onKeyDown, placeholder, disabled }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
    el.style.overflowY = el.scrollHeight > 160 ? "auto" : "hidden";
  }, [value]);
  return (
    <textarea ref={ref} value={value} onChange={onChange} onKeyDown={onKeyDown}
      placeholder={placeholder} disabled={disabled} rows={1}
      className="chat-textarea" />
  );
}

/* ── Main ── */
export default function ChatDashboard({
  activeRoom, messages, currentUser, socket, typingUsers,
  usersMap, onlineMap, onRequestReaders, onAddReaction,
  onShowMembers, onLeaveGroup, onEditGroup, onDeleteGroup, onClearChat, onToggleAdminOnly,
}) {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [sending, setSending] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [sendError, setSendError] = useState("");
  const [showAttachPopover, setShowAttachPopover] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const scrollRef = useRef();
  const typingTimer = useRef();
  const mediaRef = useRef();
  const fileRef = useRef();
  const groupMenuRef = useRef();
  const attachWrapRef = useRef();

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Helper: returns "Today", "Yesterday", or "Mon, Feb 23"
  const getDayLabel = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();

    // Start of today (local time)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (msgDay.getTime() === today.getTime()) return "Today";

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (msgDay.getTime() === yesterday.getTime()) return "Yesterday";

    // For older days within the 7-day window
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Helper: used to detect day change
  const getDayStart = (createdAt) => {
    const d = new Date(createdAt);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };

  useEffect(() => {
    if (!activeRoom) return;
    if (text && !isTyping) { socket?.emit("typing_start", { roomId: activeRoom._id }); setIsTyping(true); }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      if (isTyping) { socket?.emit("typing_stop", { roomId: activeRoom._id }); setIsTyping(false); }
    }, 2000);
    return () => clearTimeout(typingTimer.current);
  }, [text, isTyping, activeRoom?._id, socket]);

  useEffect(() => {
    const h = e => { if (groupMenuRef.current && !groupMenuRef.current.contains(e.target)) setShowGroupMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const h = ({ message }) => { setSendError(message); setTimeout(() => setSendError(""), 3000); };
    socket.on("send_error", h);
    return () => socket.off("send_error", h);
  }, [socket]);

  const handleMediaChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile({ file, isImage: file.type.startsWith("image/") });
    setShowAttachPopover(false);
    if (mediaRef.current) mediaRef.current.value = "";
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile({ file, isImage: false });
    setShowAttachPopover(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFileSend = async (file, caption) => {
    setSending(true);
    let toUpload = file;
    if (file.type.startsWith("image/")) {
      try { toUpload = await compressImage(file); } catch (e) { console.error("Compress", e); }
    }
    try {
      const result = await uploadFile(toUpload);
      if (!result?.url) throw new Error("Upload failed");
      let mediaType = "file";
      if (file.type.startsWith("image/")) mediaType = "image";
      if (file.type.startsWith("video/")) mediaType = "video";
      socket?.emit("send_message", {
        roomId: activeRoom._id, content: caption || file.name || "",
        senderId: currentUser._id, mediaType, mediaUrl: result.url,
        fileSize: file.size, repliedTo: replyingTo?._id,
      });
      setReplyingTo(null);
      setPendingFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload. Please try again.");
    }
    setSending(false);
  };

  const sendTextMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      socket?.emit("send_message", {
        roomId: activeRoom._id, content: text,
        senderId: currentUser._id, mediaType: "text", mediaUrl: "",
        repliedTo: replyingTo?._id,
      });
      setText(""); setReplyingTo(null);
    } catch (err) { console.error("Send error:", err); }
    setSending(false);
  };

  const handleKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendTextMessage(); }
  };

  const typingText = typingUsers.filter(id => id !== currentUser._id).map(id => usersMap[id]?.nickName).filter(Boolean).join(", ");
  const isAppAdmin = currentUser?.role === "admin";
  const isMainAdmin = activeRoom?.mainAdmin === currentUser?._id || activeRoom?.mainAdmin?._id === currentUser?._id;
  const isGroupAdmin = isMainAdmin || activeRoom?.groupAdmins?.some(a => (a._id || a)?.toString() === currentUser?._id);
  const canManage = isAppAdmin || isGroupAdmin;
  const canDeleteGrp = isAppAdmin || isMainAdmin;
  const canSend = !activeRoom?.onlyAdminCanSend || isGroupAdmin || isAppAdmin;
  const isMember = activeRoom?.members?.some(m => (m._id || m)?.toString() === currentUser?._id);
  const canSendNow = !!text.trim() && !sending;

  if (!activeRoom) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><Zap size={40} color="#7c3aed" /></div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, background: "linear-gradient(90deg,#a78bfa,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textAlign: "center" }}>Start Chatting</div>
        <div style={{ fontSize: 14, color: "rgba(167,139,250,0.4)", textAlign: "center" }}>Select a conversation or create a new group</div>
      </div>
    );
  }

  const isGroup = activeRoom.type === "group";

  return (
    <>
      <input type="file" ref={mediaRef} onChange={handleMediaChange} accept="image/*,video/*" style={{ display: "none" }} />
      <input type="file" ref={fileRef} onChange={handleFileChange} accept="*/*" style={{ display: "none" }} />

      {pendingFile?.isImage && <ImagePreviewModal file={pendingFile.file} onSend={handleFileSend} onCancel={() => setPendingFile(null)} sending={sending} />}
      {pendingFile && !pendingFile.isImage && <FilePreviewModal file={pendingFile.file} onSend={handleFileSend} onCancel={() => setPendingFile(null)} sending={sending} />}

      <div className="chat-shell">
        {/* Topbar */}
        <div className="chat-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
            {isGroup ? <Hash size={16} color="#a78bfa" style={{ flexShrink: 0 }} /> : <MessageSquare size={16} color="#67e8f9" style={{ flexShrink: 0 }} />}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#f0f0ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {activeRoom.name || activeRoom.members?.find(m => (m._id || m) !== currentUser?._id)?.nickName || "Chat"}
              </div>
              {isGroup && (
                <div style={{ fontSize: 10, color: "rgba(167,139,250,0.45)", display: "flex", alignItems: "center", gap: 5, marginTop: 1, flexWrap: "wrap" }}>
                  <span>{activeRoom.memberCount || activeRoom.members?.length || 0} members</span>
                  {activeRoom.onlyAdminCanSend && <span className="tag-admin-only">🔒 Admin only</span>}
                  {isMainAdmin && <span className="tag-main-admin">👑 Main Admin</span>}
                  {!isMainAdmin && isGroupAdmin && !isAppAdmin && <span className="tag-group-admin">🛡 Admin</span>}
                  {isAppAdmin && <span className="tag-app-admin">⚡ App Admin</span>}
                </div>
              )}
            </div>
          </div>

          {isGroup && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
              <button className="tb-btn tb-btn-members" onClick={onShowMembers}>
                <Users size={15} /><span className="tb-label">Members</span>
              </button>
              {canManage && (
                <button className="tb-btn tb-btn-edit" onClick={onEditGroup}>
                  <Edit size={14} /><span className="tb-label">Edit</span>
                </button>
              )}
              <div style={{ position: "relative" }} ref={groupMenuRef}>
                <button className="tb-btn tb-btn-more" onClick={() => setShowGroupMenu(v => !v)}>
                  <MoreVertical size={15} />
                </button>
                {showGroupMenu && (
                  <div className="group-menu">
                    {canManage && (
                      <button className="group-menu-item" style={{ color: activeRoom.onlyAdminCanSend ? "#4ade80" : "#fb7185" }}
                        onClick={() => { onToggleAdminOnly(); setShowGroupMenu(false); }}>
                        {activeRoom.onlyAdminCanSend ? <MessageSquareText size={15} /> : <MessageSquareOff size={15} />}
                        {activeRoom.onlyAdminCanSend ? "Allow All to Send" : "Admin-Only Send"}
                      </button>
                    )}
                    {canManage && (
                      <>
                        <div className="group-menu-divider" />
                        <button className="group-menu-item" style={{ color: "#fb7185" }} onClick={() => { onClearChat(); setShowGroupMenu(false); }}>
                          <Trash2 size={15} /> Clear Chat
                        </button>
                      </>
                    )}
                    {isMember && !isAppAdmin && (
                      <>
                        <div className="group-menu-divider" />
                        <button className="group-menu-item" style={{ color: "#f97316" }} onClick={() => { onLeaveGroup(); setShowGroupMenu(false); }}>
                          <DoorOpen size={15} /> Leave Group
                        </button>
                      </>
                    )}
                    {canDeleteGrp && (
                      <>
                        <div className="group-menu-divider" />
                        <button className="group-menu-item" style={{ color: "#ef4444" }} onClick={() => { onDeleteGroup(); setShowGroupMenu(false); }}>
                          <Trash2 size={15} /> Delete Group
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        {/* Messages */}
        <div className="chat-messages">
          {messages.map((m, i) => {
            const showHeader = i === 0 ||
              getDayStart(m.createdAt) !== getDayStart(messages[i - 1].createdAt);

            return (
              <div key={m._id}>   {/* changed from key={i} → better */}
                {showHeader && (
                  <div className="flex justify-center my-6">
                    <div className="
                                       px-4 py-1.5 
                                       text-xs font-medium 
                                       text-gray-500
                                       bg-white/5 
                                       backdrop-blur-md
                                       border border-white/10
                                       rounded-full
                                       shadow-md
                                     ">
                      {getDayLabel(m.createdAt)}
                    </div>
                  </div>
                )}
                <Message
                  key={m._id}
                  message={m}
                  currentUser={currentUser}
                  usersMap={usersMap}
                  isGroup={isGroup}
                  onRequestReaders={onRequestReaders}
                  onReply={msg => setReplyingTo(msg)}
                  onAddReaction={onAddReaction}
                />
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* Input area */}
        <div className="chat-inputbar">
          {sendError && (
            <div className="send-error-bar">
              <span>🔒 {sendError}</span>
              <button onClick={() => setSendError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#fb7185", display: "flex" }}><X size={14} /></button>
            </div>
          )}

          {typingText && (
            <div className="typing-indicator">
              <span style={{ display: "inline-flex", gap: 3 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} className="typing-dot" style={{ animation: `typingDot 1.2s ${i * 0.2}s ease-in-out infinite` }} />
                ))}
              </span>
              {typingText} is typing…
            </div>
          )}

          {replyingTo && (
            <div className="reply-preview">
              <span style={{ fontSize: 13, color: "rgba(167,139,250,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                Replying to: <span style={{ color: "#f0f0ff" }}>{replyingTo.content?.substring(0, 55)}…</span>
              </span>
              <button onClick={() => setReplyingTo(null)} style={{ background: "none", border: "none", color: "#fb7185", fontSize: 18, cursor: "pointer", paddingLeft: 8, flexShrink: 0 }}>✕</button>
            </div>
          )}

          {isGroup && activeRoom.onlyAdminCanSend && !canSend ? (
            <div className="admin-only-notice">🔒 Only admins can send messages in this group</div>
          ) : (
            <div className="chat-inputbox">
              {/* Attach button with popover */}
              <div className="attach-popover-wrap" ref={attachWrapRef}>
                <button
                  className="chat-attach-btn"
                  onClick={() => setShowAttachPopover(v => !v)}
                  title="Attach"
                  aria-label="Attach file"
                >
                  <Paperclip size={20} />
                </button>
                {showAttachPopover && (
                  <AttachPopover
                    onSelectMedia={() => { mediaRef.current.click(); setShowAttachPopover(false); }}
                    onSelectFile={() => { fileRef.current.click(); setShowAttachPopover(false); }}
                    onClose={() => setShowAttachPopover(false)}
                  />
                )}
              </div>

              <AutoTextarea value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Type a message… (Shift+Enter for new line)" disabled={sending} />
              <button onClick={sendTextMessage} disabled={!canSendNow} title="Send"
                className={`send-btn ${canSendNow ? "active" : "inactive"}`}>
                {sending
                  ? <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", animation: "spin 0.8s linear infinite" }} />
                  : <Send size={16} />}
              </button>
            </div>
          )}
          <div className="chat-hint">Enter to send · Shift+Enter for new line</div>
        </div>
      </div>
    </>
  );
}
import React, { useState } from "react";
import { Reply } from "lucide-react";

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

function MediaWithLoader({ src, type, fileName, fileSize, isOwn }) {
  const [loaded, setLoaded]         = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress]     = useState(0);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true); setProgress(0);
    try {
      const res = await fetch(src);
      const total = parseInt(res.headers.get("content-length") || "0");
      const reader = res.body.getReader();
      let received = 0;
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value); received += value.length;
        if (total) setProgress(Math.round((received / total) * 100));
      }
      const url = URL.createObjectURL(new Blob(chunks));
      const a = document.createElement("a");
      a.href = url; a.download = fileName || "file"; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error("Download failed", e); }
    setDownloading(false); setProgress(0);
  };

  if (type === "image") {
    return (
      <div style={{ position: "relative", maxWidth: 100 }}>
        {!loaded && (
          <div className="msg-img-loader">
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.3)", borderTop: "3px solid #a78bfa", animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: 12, color: "rgba(167,139,250,0.5)" }}>Loading…</span>
          </div>
        )}
        <img 
          src={src} 
          alt="Image" 
          onLoad={() => setLoaded(true)}
          className="msg-img" 
          style={{ 
            display: loaded ? "block" : "none",
            maxWidth: "200px"   // ← overrides the old 260px
          }}
          onClick={() => window.open(src, "_blank")} 
        />
        {loaded && fileSize && <div className="msg-img-size">{formatFileSize(fileSize)}</div>}
      </div>
    );
  }

  if (type === "video") {
    return <video controls style={{ maxWidth: 200, borderRadius: 12 }}><source src={src} /></video>;
  }

  // File download card
  const ext  = (fileName || "").split(".").pop().toUpperCase().slice(0, 4);
  const size = formatFileSize(fileSize);

  return (
    <div 
      onClick={handleDownload} 
      className={`msg-file-card ${isOwn ? "own" : "other"}`}
      style={{ maxWidth: "300px" }}   // ← increased
    >
      <div className={`msg-file-icon ${isOwn ? "own" : "other"}`}>
        {downloading
          ? <div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.25)", borderTop: "3px solid #a78bfa", animation: "spin 0.8s linear infinite" }} />
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isOwn ? "rgba(255,255,255,0.7)" : "#a78bfa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
        }
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: isOwn ? "rgba(255,255,255,0.9)" : "#e8e8ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {fileName || "File"}
        </div>
        <div style={{ fontSize: 11, color: isOwn ? "rgba(255,255,255,0.5)" : "rgba(167,139,250,0.5)", marginTop: 2 }}>
          {downloading ? `Downloading… ${progress}%` : [ext, size].filter(Boolean).join(" · ")}
        </div>
        {downloading && (
          <div className="msg-file-progress">
            <div className="msg-file-progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Message({ message, currentUser, usersMap, isGroup, onRequestReaders, onReply, onAddReaction }) {
  const [showEmoji, setShowEmoji] = useState(false);
  const isSystem = message.type === "system";
  const isOwn    = message.senderId?.toString() === currentUser?._id;
  const sender   = message.senderName || usersMap[message.senderId]?.nickName || "Unknown";
  const emojis   = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  if (isSystem) {
    return (
      <div className="msg-system">
        <span>{message.content}</span>
      </div>
    );
  }

  const renderContent = () => {
    switch (message.mediaType) {
      case "image": return <MediaWithLoader src={message.mediaUrl} type="image" fileName={message.content} fileSize={message.fileSize} isOwn={isOwn} />;
      case "video": return <MediaWithLoader src={message.mediaUrl} type="video" fileName={message.content} fileSize={message.fileSize} isOwn={isOwn} />;
      case "file":  return <MediaWithLoader src={message.mediaUrl} type="file"  fileName={message.content} fileSize={message.fileSize} isOwn={isOwn} />;
      default:      return <p style={{ margin: 0, lineHeight: 1.6, fontSize: 15, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{message.content}</p>;
    }
  };

  const renderTicks = () => {
    if (!isOwn) return null;
    const delivered = message.deliveredCount ?? message.deliveredTo?.length ?? 0;
    const read      = message.readCount      ?? message.readBy?.length      ?? 0;
    if (!isGroup) {
      if (read > 0)      return <span style={{ color: "#67e8f9", fontSize: 14 }}>✓✓</span>;
      if (delivered > 0) return <span style={{ color: "rgba(167,139,250,0.5)", fontSize: 14 }}>✓✓</span>;
      return <span style={{ color: "rgba(167,139,250,0.35)", fontSize: 14 }}>✓</span>;
    } else {
      if (read > 0) {
        return (
          <span onClick={e => { e.stopPropagation(); onRequestReaders(message._id); }}
            style={{ fontSize: 12, color: "#67e8f9", cursor: "pointer", textDecoration: "underline" }}>
            Seen {read}{message.roomMembersCount && read === message.roomMembersCount - 1 ? " (all)" : ""}
          </span>
        );
      }
      if (delivered > 0) return <span style={{ fontSize: 12, color: "rgba(167,139,250,0.4)" }}>Delivered {delivered}</span>;
      return <span style={{ fontSize: 12, color: "rgba(167,139,250,0.3)" }}>Sent</span>;
    }
  };

  return (
    <div className="msg-row" style={{ justifyContent: isOwn ? "flex-end" : "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: isOwn ? "flex-end" : "flex-start", maxWidth: "72%" }}>

        {!isOwn && isGroup && <div className="msg-sender-name">{sender}</div>}

        {message.repliedTo && (
          <div className={isOwn ? "msg-reply-preview-own" : "msg-reply-preview"}>
            ↩ {message.repliedTo.content?.substring(0, 55) || "Message"}…
          </div>
        )}

        <div className={isOwn ? "msg-bubble-own" : "msg-bubble-other"}>
          {renderContent()}
          
          {/* Updated caption for images & videos – now wraps + fixed width */}
          {message.content && message.mediaType && !["text", "file"].includes(message.mediaType) && (
            <p style={{ 
              marginTop: 6, 
              fontSize: 13, 
              opacity: 0.8,
              maxWidth: "300px",           // ← matches new image/video width
              wordBreak: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "pre-wrap"
            }}>
              {message.content}
            </p>
          )}
        </div>

        {message.reactions?.length > 0 && (
          <div className="msg-reactions">
            {message.reactions.map((r, i) => (
              <span key={i} className="msg-reaction">{r.emoji} {r.userIds.length}</span>
            ))}
          </div>
        )}

        <div className="msg-time-row">
          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          {renderTicks()}
        </div>

        <div className="msg-actions">
          <button className="msg-action-btn" onClick={e => { e.stopPropagation(); onReply(message); }} title="Reply">
            <Reply size={15} />
          </button>
          <button className="msg-action-btn" onClick={e => { e.stopPropagation(); setShowEmoji(v => !v); }} title="React">
            😊
          </button>
        </div>

        {showEmoji && (
          <div className="emoji-picker" onClick={e => e.stopPropagation()}>
            {emojis.map(emoji => (
              <span key={emoji} className="emoji-opt"
                onClick={e => { e.stopPropagation(); onAddReaction(message._id, emoji); setShowEmoji(false); }}>
                {emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
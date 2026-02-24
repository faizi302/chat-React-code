// Message.jsx
import React, { useState } from "react";

export default function Message({
  message,
  currentUser,
  usersMap,
  isGroup,
  onRequestReaders,
  onReply,
  onAddReaction,
}) {
  const isSystem = message.type === "system";
  const isOwn = message.senderId?.toString() === currentUser?._id;
  const senderName = message.senderName || usersMap[message.senderId]?.nickName || "Unknown";
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  /* ── System message ── */
  if (isSystem) {
    return (
      <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
        <span style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(124,58,237,0.2)",
          color: "rgba(167,139,250,0.55)",
          fontSize: 12, padding: "5px 16px", borderRadius: 999,
        }}>
          {message.content}
        </span>
      </div>
    );
  }

  const renderContent = () => {
    switch (message.mediaType) {
      case "image":
        return (
          <img
            src={message.mediaUrl}
            alt="Image"
            style={{ maxWidth: 260, borderRadius: 12, display: "block" }}
          />
        );
      case "video":
        return (
          <video controls style={{ maxWidth: 260, borderRadius: 12 }}>
            <source src={message.mediaUrl} type="video/mp4" />
          </video>
        );
      case "file":
        return (
          <a
            href={message.mediaUrl}
            download
            style={{
              color: isOwn ? "rgba(255,255,255,0.9)" : "#67e8f9",
              textDecoration: "underline", fontSize: 14,
            }}
          >
            📎 {message.content || "Download File"}
          </a>
        );
      default:
        return (
          <p style={{ margin: 0, lineHeight: 1.6, fontSize: 15 }}>
            {message.content}
          </p>
        );
    }
  };

  const renderTicks = () => {
    if (!isOwn) return null;
    const deliveredCount = message.deliveredCount ?? message.deliveredTo?.length ?? 0;
    const readCount      = message.readCount      ?? message.readBy?.length      ?? 0;

    if (!isGroup) {
      if (readCount > 0)      return <span style={{ color: "#67e8f9", fontSize: 14 }}>✓✓</span>;
      if (deliveredCount > 0) return <span style={{ color: "rgba(167,139,250,0.5)", fontSize: 14 }}>✓✓</span>;
      return <span style={{ color: "rgba(167,139,250,0.35)", fontSize: 14 }}>✓</span>;
    } else {
      if (readCount > 0) {
        return (
          <span
            onClick={e => { e.stopPropagation(); onRequestReaders(message._id); }}
            style={{ fontSize: 12, color: "#67e8f9", cursor: "pointer", textDecoration: "underline" }}
          >
            Seen {readCount}{message.roomMembersCount && readCount === message.roomMembersCount - 1 ? " (all)" : ""}
          </span>
        );
      }
      if (deliveredCount > 0) return <span style={{ fontSize: 12, color: "rgba(167,139,250,0.4)" }}>Delivered {deliveredCount}</span>;
      return <span style={{ fontSize: 12, color: "rgba(167,139,250,0.3)" }}>Sent</span>;
    }
  };

  return (
    <div
      onClick={() => onReply(message)}
      style={{
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        marginBottom: 8,
        padding: "4px 8px",
        borderRadius: 12,
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.05)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: isOwn ? "flex-end" : "flex-start",
        maxWidth: "72%",
      }}>

        {/* Sender name */}
        {!isOwn && isGroup && (
          <div style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa", marginBottom: 4, paddingLeft: 6 }}>
            {senderName}
          </div>
        )}

        {/* Replied-to preview */}
        {message.repliedTo && (
          <div style={{
            background: isOwn ? "rgba(0,0,0,0.28)" : "rgba(124,58,237,0.12)",
            borderLeft: "3px solid rgba(167,139,250,0.55)",
            padding: "6px 12px", borderRadius: 8,
            fontSize: 13, color: "rgba(196,181,253,0.7)",
            fontStyle: "italic", marginBottom: 6, maxWidth: "100%",
          }}>
            ↩ {message.repliedTo.content?.substring(0, 55) || "Message"}…
          </div>
        )}

        {/* Bubble */}
        <div style={{
          padding: "12px 16px",
          borderRadius: isOwn ? "18px 18px 5px 18px" : "18px 18px 18px 5px",
          fontSize: 15, lineHeight: 1.6,
          wordBreak: "break-word",
          background: isOwn
            ? "linear-gradient(135deg,#7c3aed,#4f46e5)"
            : "rgba(255,255,255,0.07)",
          color: isOwn ? "#ffffff" : "#e8e8ff",
          border: isOwn ? "none" : "1px solid rgba(124,58,237,0.18)",
          boxShadow: isOwn
            ? "0 3px 16px rgba(124,58,237,0.4)"
            : "0 2px 8px rgba(0,0,0,0.25)",
        }}>
          {renderContent()}
          {message.content && message.mediaType && message.mediaType !== "text" && (
            <p style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>{message.content}</p>
          )}
        </div>

        {/* Reactions */}
        {message.reactions?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
            {message.reactions.map((r, i) => (
              <span
                key={i}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(124,58,237,0.25)",
                  borderRadius: 999, padding: "3px 10px",
                  fontSize: 14, cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.55)"; e.currentTarget.style.transform = "scale(1.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.25)"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                {r.emoji} {r.userIds.length}
              </span>
            ))}
          </div>
        )}

        {/* Time + ticks */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          marginTop: 5, padding: "0 6px",
          fontSize: 12, color: "rgba(167,139,250,0.4)",
        }}>
          <span>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {renderTicks()}
        </div>

        {/* React button */}
        <button
          onClick={e => { e.stopPropagation(); setShowEmojiPicker(v => !v); }}
          style={{
            fontSize: 12, color: "rgba(167,139,250,0.35)",
            background: "none", border: "none", cursor: "pointer",
            padding: "2px 8px", borderRadius: 6, marginTop: 2,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#a78bfa"; e.currentTarget.style.background = "rgba(124,58,237,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(167,139,250,0.35)"; e.currentTarget.style.background = "none"; }}
        >
          React
        </button>

        {/* Emoji picker */}
        {showEmojiPicker && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              display: "flex", gap: 6, marginTop: 6,
              background: "rgba(13,0,32,0.96)",
              border: "1px solid rgba(124,58,237,0.35)",
              borderRadius: 999, padding: "8px 14px",
              boxShadow: "0 6px 24px rgba(0,0,0,0.5)",
            }}
          >
            {commonEmojis.map(emoji => (
              <span
                key={emoji}
                onClick={e => {
                  e.stopPropagation();
                  onAddReaction(message._id, emoji);
                  setShowEmojiPicker(false);
                }}
                style={{
                  fontSize: 20, cursor: "pointer",
                  transition: "transform 0.15s", display: "inline-block",
                  padding: "0 2px",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                {emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// src/components/admin/AdminAvatar.jsx

export default function AdminAvatar({ src, name, size = 36 }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size, height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid rgba(124,58,237,0.35)",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700,
        fontSize: Math.round(size * 0.4),
        color: "white",
        border: "2px solid rgba(124,58,237,0.3)",
      }}
    >
      {(name || "?")[0]?.toUpperCase()}
    </div>
  );
}
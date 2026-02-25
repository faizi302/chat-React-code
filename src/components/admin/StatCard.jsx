// src/components/admin/StatCard.jsx
// Single stat card — reused 4 times in the dashboard for: Total Users, Active, Admins, Groups

export default function StatCard({ label, value, color, icon }) {
  return (
    <div
      style={{
        background: "#12122a",
        border: "1px solid rgba(124,58,237,0.2)",
        borderRadius: 20,
        padding: "20px 22px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Left: number + label */}
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
          <div style={{ fontSize: 13, color: "rgba(167,139,250,0.5)", marginTop: 4 }}>{label}</div>
        </div>

        {/* Right: icon bubble */}
        <div
          style={{
            background: "rgba(124,58,237,0.08)",
            padding: 10,
            borderRadius: 12,
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
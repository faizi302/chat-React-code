// src/components/admin/UsersTable.jsx
// Uses the shared DataTable component — just defines the columns + renderRow for users.
import DataTable from "./DataTable.jsx";
import AdminAvatar from "./AdminAvatar.jsx";

const USER_COLUMNS = ["User", "Email", "Phone", "Role", "Status", "Joined", "Actions"];

export default function UsersTable({ users, loading, search, currentUserId, actionLoading, onToggle, onSidebar, onDelete }) {

  if (loading) {
    return <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(167,139,250,0.4)", fontSize: 15 }}>Loading users...</div>;
  }

  // This function returns an array of <td> elements for each user row
  const renderRow = (user) => {
    const isMe     = user._id === currentUserId;
    const isActive = user.isActive !== false;

    return [
      // ── User name + avatar ──
      <td key="user" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AdminAvatar src={user.profileImage} name={user.name} size={36} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#f0f0ff" }}>
              {user.nickName || user.name}
            </div>
            {isMe && <span style={{ fontSize: 10, color: "#a78bfa" }}>• You</span>}
          </div>
        </div>
      </td>,

      // ── Email ──
      <td key="email" style={{ padding: "12px 16px", color: "rgba(167,139,250,0.55)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {user.email}
      </td>,

      // ── Phone ──
      <td key="phone" style={{ padding: "12px 16px", color: "rgba(167,139,250,0.55)" }}>
        {user.phone || "—"}
      </td>,

      // ── Role badge ──
      <td key="role" style={{ padding: "12px 16px" }}>
        <span
          style={{
            padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
            background: user.role === "admin" ? "rgba(236,72,153,0.15)" : "rgba(124,58,237,0.12)",
            color:      user.role === "admin" ? "#f9a8d4"               : "#a78bfa",
            border:    `1px solid ${user.role === "admin" ? "rgba(236,72,153,0.3)" : "rgba(124,58,237,0.2)"}`,
          }}
        >
          {user.role === "admin" ? "🛡 Admin" : "👤 User"}
        </span>
      </td>,

      // ── Status badge ──
      <td key="status" style={{ padding: "12px 16px" }}>
        <span
          style={{
            padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
            background: isActive ? "rgba(74,222,128,0.1)"  : "rgba(244,63,94,0.1)",
            color:      isActive ? "#4ade80"                : "#fb7185",
            border:    `1px solid ${isActive ? "rgba(74,222,128,0.25)" : "rgba(244,63,94,0.25)"}`,
          }}
        >
          {isActive ? "● Active" : "● Disabled"}
        </span>
      </td>,

      // ── Joined date ──
      <td key="joined" style={{ padding: "12px 16px", fontSize: 12, color: "rgba(167,139,250,0.35)", whiteSpace: "nowrap" }}>
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
      </td>,

      // ── Actions ──
      <td key="actions" style={{ padding: "12px 16px" }}>
        {isMe ? (
          // Can't act on yourself
          <span style={{ fontSize: 12, color: "rgba(167,139,250,0.3)", fontStyle: "italic" }}>—</span>
        ) : (
          <div style={{ display: "flex", gap: 5, flexWrap: "nowrap" }}>

            {/* Enable / Disable toggle */}
            <button
              onClick={() => onToggle(user._id)}
              disabled={actionLoading === user._id + "_toggle"}
              style={{
                padding: "5px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700,
                cursor: "pointer", whiteSpace: "nowrap",
                background: isActive ? "rgba(244,63,94,0.1)"  : "rgba(74,222,128,0.1)",
                color:      isActive ? "#fb7185"               : "#4ade80",
                border:    `1px solid ${isActive ? "rgba(244,63,94,0.2)" : "rgba(74,222,128,0.2)"}`,
              }}
            >
              {actionLoading === user._id + "_toggle" ? "..." : isActive ? "Disable" : "Enable"}
            </button>

            {/* Sidebar visibility — only for non-admins */}
            {user.role !== "admin" && (
              <button
                onClick={() => onSidebar(user)}
                style={{ padding: "5px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(6,182,212,0.1)", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.2)", whiteSpace: "nowrap" }}
              >
                👁 Sidebar
              </button>
            )}

            {/* Delete */}
            <button
              onClick={() => onDelete(user._id)}
              style={{ padding: "5px 10px", borderRadius: 7, fontSize: 13, cursor: "pointer", background: "rgba(244,63,94,0.08)", color: "#fb7185", border: "1px solid rgba(244,63,94,0.15)" }}
            >
              🗑
            </button>
          </div>
        )}
      </td>,
    ];
  };

  return (
    <DataTable
      columns={USER_COLUMNS}
      data={users}
      renderRow={renderRow}
      emptyText={search ? "No users match your search." : "No users found."}
    />
  );
}
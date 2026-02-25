// src/components/admin/GroupsTable.jsx
// Uses the SAME DataTable component as UsersTable — just different columns + renderRow.
import DataTable from "./DataTable.jsx";
import AdminAvatar from "./AdminAvatar.jsx";

const GROUP_COLUMNS = ["Group", "Members", "Main Admin", "Settings", "Created", "Actions"];

export default function GroupsTable({ groups, loading, search, onManage, onDelete }) {

  if (loading) {
    return <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(167,139,250,0.4)", fontSize: 15 }}>Loading groups...</div>;
  }

  // Returns array of <td> elements for each group row
  const renderRow = (group) => {
    const mainAdmin = group.mainAdmin;

    return [
      // ── Group name + avatar ──
      <td key="group" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AdminAvatar src={group.profileImage} name={group.name} size={38} />
          <div style={{ fontWeight: 600, fontSize: 14, color: "#f0f0ff" }}>{group.name}</div>
        </div>
      </td>,

      // ── Member count ──
      <td key="members" style={{ padding: "12px 16px", color: "rgba(167,139,250,0.6)" }}>
        {group.members?.length || 0}
      </td>,

      // ── Main admin ──
      <td key="mainAdmin" style={{ padding: "12px 16px" }}>
        {mainAdmin ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <AdminAvatar src={mainAdmin.profileImage} name={mainAdmin.nickName || mainAdmin.name} size={24} />
            <span style={{ fontSize: 13, color: "#f9a8d4" }}>
              {mainAdmin.nickName || mainAdmin.name || "—"}
            </span>
          </div>
        ) : (
          <span style={{ color: "rgba(167,139,250,0.3)" }}>—</span>
        )}
      </td>,

      // ── Settings badges ──
      <td key="settings" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {group.onlyAdminCanSend && (
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "rgba(251,113,133,0.12)", color: "#fb7185", border: "1px solid rgba(251,113,133,0.2)", fontWeight: 700 }}>
              🔒 Admin-Only
            </span>
          )}
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "rgba(124,58,237,0.1)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.18)", fontWeight: 700 }}>
            {group.groupAdmins?.length || 0} admins
          </span>
        </div>
      </td>,

      // ── Created date ──
      <td key="created" style={{ padding: "12px 16px", fontSize: 12, color: "rgba(167,139,250,0.35)", whiteSpace: "nowrap" }}>
        {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : "—"}
      </td>,

      // ── Actions ──
      <td key="actions" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 5 }}>
          <button
            onClick={() => onManage(group)}
            style={{ padding: "5px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)", whiteSpace: "nowrap" }}
          >
            ⚙ Manage
          </button>
          <button
            onClick={() => { if (window.confirm(`Delete group "${group.name}"?`)) onDelete(group._id); }}
            style={{ padding: "5px 10px", borderRadius: 7, fontSize: 13, cursor: "pointer", background: "rgba(244,63,94,0.08)", color: "#fb7185", border: "1px solid rgba(244,63,94,0.15)" }}
          >
            🗑
          </button>
        </div>
      </td>,
    ];
  };

  return (
    <DataTable
      columns={GROUP_COLUMNS}
      data={groups}
      renderRow={renderRow}
      emptyText={search ? "No groups match your search." : "No groups found."}
    />
  );
}
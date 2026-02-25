// src/components/admin/DataTable.jsx
// ONE table component reused for both the Users table and Groups table.
// Pass:  columns  → array of header strings
//        data     → array of row data
//        renderRow → function(item, index) that returns an array of <td> elements
//        emptyText → string shown when no rows

export default function DataTable({ columns, data, renderRow, emptyText = "No data found." }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Head ── */}
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(124,58,237,0.12)" }}>
            {columns.map(col => (
              <th
                key={col}
                style={{
                  padding: "10px 16px",
                  textAlign: "left",
                  fontWeight: 700,
                  fontSize: 11,
                  color: "rgba(167,139,250,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  whiteSpace: "nowrap",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody>
          {data.map((item, i) => (
            <tr
              key={item._id || i}
              style={{ borderBottom: i < data.length - 1 ? "1px solid rgba(124,58,237,0.07)" : "none" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(124,58,237,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {renderRow(item, i)}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Empty state */}
      {data.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "rgba(167,139,250,0.3)",
            fontSize: 14,
            fontStyle: "italic",
          }}
        >
          {emptyText}
        </div>
      )}
    </div>
  );
}
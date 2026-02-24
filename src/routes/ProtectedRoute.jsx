import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Spinner used while auth is loading
function Spinner() {
  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#07071a", gap: 16,
    }}>
      <div style={{
        width: 50, height: 50, borderRadius: "50%",
        border: "3px solid rgba(124,58,237,0.2)",
        borderTop: "3px solid #7c3aed",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "rgba(167,139,250,0.5)", fontSize: 14, margin: 0 }}>Loading...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Standard protected route (any logged-in user) ──────────────
export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <Spinner />;
  return currentUser ? children : <Navigate to="/login" replace />;
}

// ── Admin-only protected route ─────────────────────────────────
export function AdminRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
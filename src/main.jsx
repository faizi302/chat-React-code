import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute, { AdminRoute } from "./routes/ProtectedRoute";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import App from "./App";
import "./index.css";

// Redirect logged-in users away from public pages
function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  return currentUser ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

      {/* Admin-only route */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      {/* Main chat — any logged-in user */}
      <Route path="/" element={<ProtectedRoute><App /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
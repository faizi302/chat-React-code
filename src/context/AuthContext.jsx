// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { getUserFromToken, logout as apiLogout } from "../api/api.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load — restore session from cookie
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getUserFromToken();
        if (data?.user) setCurrentUser(data.user);
      } catch {
        // Not logged in — that's fine
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Called after login/signup API returns a user
  const login = (userData) => {
    setCurrentUser(userData);
  };

  // Called after profile update — merges changed fields into currentUser
  const updateCurrentUser = (userData) => {
    setCurrentUser(prev => ({ ...prev, ...userData }));
  };

  // Called on logout — clears cookie on server + clears local state
  const logout = async () => {
    try { await apiLogout(); } catch {}
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, updateCurrentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
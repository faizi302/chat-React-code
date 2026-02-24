// src/api/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ── Auth ──────────────────────────────────────────────────────
export const signup = async (data) => {
  try {
    const res = await api.post("/auth/signup", data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Signup failed");
  }
};

export const login = async (data) => {
  try {
    const res = await api.post("/auth/login", data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Login failed");
  }
};

export const logout = async () => {
  try { await api.post("/auth/logout"); } catch {}
};

export const getUserFromToken = async () => {
  try {
    const res = await api.get("/auth/me");
    return res.data;
  } catch { return null; }
};

export const updateUser = async (data) => {
  try {
    const res = await api.patch("/auth/me", data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Update failed");
  }
};

// ── Users ─────────────────────────────────────────────────────
export const getAllUsers = async () => {
  try {
    const res = await api.get("/users");
    return res.data;
  } catch { return []; }
};

export const getUserById = async (id) => {
  try {
    const res = await api.get(`/users/${id}`);
    return res.data;
  } catch { return null; }
};

export const deleteUser = async (id) => {
  try {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Delete failed");
  }
};

export const toggleUserStatus = async (id) => {
  try {
    const res = await api.patch(`/users/${id}/toggle-status`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Toggle failed");
  }
};

export const getVisibleUsers = async (userId) => {
  try {
    const res = await api.get(`/users/${userId}/visible-users`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to get visible users");
  }
};

export const setVisibleUsers = async (userId, visibleUserIds) => {
  try {
    const res = await api.put(`/users/${userId}/visible-users`, { visibleUserIds });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to set visible users");
  }
};

// ── Rooms ──────────────────────────────────────────────────────
export const createOrGetRoom = async (payload) => {
  try {
    const res = await api.post("/rooms", payload);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Room creation failed");
  }
};

export const updateRoom = async (id, payload) => {
  try {
    const res = await api.put(`/rooms/${id}`, payload);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Room update failed");
  }
};

export const getUserRooms = async (userId) => {
  if (!userId) return [];
  try {
    const res = await api.get(`/rooms/user/${userId}`);
    return res.data;
  } catch { return []; }
};

// App admin: get ALL groups
export const getAllRooms = async () => {
  try {
    const res = await api.get("/rooms/all");
    return res.data;
  } catch { return []; }
};

// Group admin: add member
export const addGroupMember = async (roomId, userId) => {
  try {
    const res = await api.post(`/rooms/${roomId}/members`, { userId });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to add member");
  }
};

// Group admin: remove member
export const removeGroupMember = async (roomId, userId) => {
  try {
    const res = await api.delete(`/rooms/${roomId}/members/${userId}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to remove member");
  }
};

// Main admin: promote to sub-admin
export const promoteToGroupAdmin = async (roomId, userId) => {
  try {
    const res = await api.post(`/rooms/${roomId}/admins/${userId}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to promote");
  }
};

// Main admin: demote sub-admin
export const demoteGroupAdmin = async (roomId, userId) => {
  try {
    const res = await api.delete(`/rooms/${roomId}/admins/${userId}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to demote");
  }
};

// Group/app admin: toggle onlyAdminCanSend
export const toggleAdminOnlySend = async (roomId) => {
  try {
    const res = await api.patch(`/rooms/${roomId}/admin-only-send`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to toggle setting");
  }
};

// Main/app admin: delete group
export const deleteRoom = async (roomId) => {
  try {
    const res = await api.delete(`/rooms/${roomId}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to delete group");
  }
};

// Admin: clear chat history
export const clearRoomChat = async (roomId) => {
  try {
    const res = await api.delete(`/rooms/${roomId}/messages`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to clear chat");
  }
};

// ── Messages ──────────────────────────────────────────────────
export const getMessagesByRoom = async (roomId) => {
  try {
    const res = await api.get(`/messages/${roomId}`);
    return res.data;
  } catch { return []; }
};

// ── Upload ────────────────────────────────────────────────────
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Upload failed");
  }
};
// MainLayout.jsx
// Only needed if you use React Router. Otherwise all layout lives in App.jsx.
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function MainLayout({
  currentUser, activeRoom,
  onJoinClick, onLeaveClick, onEditClick, onLogout, onShowMembers,
  allUsers, onlineMap, usersMap, rooms,
  onSelectUser, onSelectRoom, activeRoomId, currentUserId, onEditGroup,
  sidebarOpen, onToggleSidebar,
}) {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "#09091a" }}>
      <Header
        currentUser={currentUser} activeRoom={activeRoom}
        onJoinClick={onJoinClick} onLeaveClick={onLeaveClick}
        onEditClick={onEditClick} onLogout={onLogout}
        onShowMembers={onShowMembers}
        onToggleSidebar={onToggleSidebar}
        sidebarOpen={sidebarOpen}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {sidebarOpen && (
          <div
            onClick={onToggleSidebar}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 20 }}
            className="md:hidden"
          />
        )}

        <Sidebar
          allUsers={allUsers} onlineMap={onlineMap} usersMap={usersMap} rooms={rooms}
          onSelectUser={onSelectUser} onSelectRoom={onSelectRoom}
          activeRoomId={activeRoomId} currentUserId={currentUserId}
          onEditGroup={onEditGroup} isOpen={sidebarOpen}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <Outlet />
        </div>
      </div>

      <Footer />
    </div>
  );
}
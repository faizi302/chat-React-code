// MainLayout.jsx
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
    <div className="flex flex-col h-screen overflow-hidden bg-[#09091a]">
      <Header
        currentUser={currentUser}
        activeRoom={activeRoom}
        onJoinClick={onJoinClick}
        onLeaveClick={onLeaveClick}
        onEditClick={onEditClick}
        onLogout={onLogout}
        onShowMembers={onShowMembers}
        onToggleSidebar={onToggleSidebar}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1  overflow-hidden ">
        {/* Mobile overlay — clicking closes sidebar */}
        {sidebarOpen && (
          <div
            onClick={onToggleSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          />
        )}

        {/* Sidebar — absolute on mobile so it overlays, relative on desktop */}
        <Sidebar
          allUsers={allUsers}
          onlineMap={onlineMap}
          usersMap={usersMap}
          rooms={rooms}
          onSelectUser={onSelectUser}
          onSelectRoom={onSelectRoom}
          activeRoomId={activeRoomId}
          currentUserId={currentUserId}
          onEditGroup={onEditGroup}
          isOpen={sidebarOpen}
        />

        {/* Main content — always takes full width on mobile */}
        <div className="flex flex-col flex-1 overflow-hidden  ">
          <Outlet  />
        </div>
      </div>

      <Footer />
    </div>
  );
}
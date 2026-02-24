// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Sidebar from "./layout/Sidebar";
import ChatDashboard from "./components/ChatDashboard";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import EditProfileModal from "./components/EditProfileModal";
import JoinModal from "./components/JoinModal";
import LeaveRoomModal from "./components/LeaveRoomModal";
import EditGroupModal from "./components/EditGroupModal";
import ReaderListModal from "./components/ReaderListModal";
import GroupMembersModal from "./components/GroupMembersModal";
import ConfirmModal from "./components/ConfirmModal";
import {
  getAllUsers, getUserRooms, getMessagesByRoom,
  createOrGetRoom, updateRoom,
  toggleAdminOnlySend, deleteRoom, clearRoomChat,
} from "./api/api";
import { useAuth } from "./context/AuthContext";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function App() {
  const { currentUser, logout } = useAuth();
  const socketRef = useRef(null);

  const [allUsers, setAllUsers]   = useState([]);
  const [usersMap, setUsersMap]   = useState({});
  const [onlineMap, setOnlineMap] = useState({});
  const [myRooms, setMyRooms]     = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages]   = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const [showEditProfile, setShowEditProfile]       = useState(false);
  const [showJoinModal, setShowJoinModal]           = useState(false);
  const [showLeaveModal, setShowLeaveModal]         = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showReaderModal, setShowReaderModal]       = useState(false);
  const [readerList, setReaderList]                 = useState([]);
  const [showMembersModal, setShowMembersModal]     = useState(false);
  const [sidebarOpen, setSidebarOpen]               = useState(false);
  const [confirmAction, setConfirmAction]           = useState(null); // { type, message, onConfirm }

  const activeRoomRef = useRef(activeRoom);
  useEffect(() => { activeRoomRef.current = activeRoom; }, [activeRoom]);

  /* ── Socket setup ── */
  useEffect(() => {
    if (!currentUser) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: { token: "" },
    });
    socketRef.current = socket;

    const loadData = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(users);
        const uMap = {};
        users.forEach(u => {
          uMap[u._id] = {
            nickName: u.nickName || u.name,
            lastSeen: u.lastSeen,
            profileImage: u.profileImage || "",
            fullName: u.name,
          };
        });
        setUsersMap(uMap);
        const rooms = await getUserRooms(currentUser._id);
        setMyRooms(rooms.map(r => ({ ...r, memberCount: r.members?.length || 1 })));
      } catch (err) { console.error("loadData error:", err); }
    };
    loadData();

    socket.on("online_list", ids => {
      const m = {};
      ids.forEach(id => (m[id] = { status: "online" }));
      setOnlineMap(m);
    });

    socket.on("user_status", ({ userId, status, lastSeen }) => {
      setOnlineMap(prev => ({ ...prev, [userId]: { status, lastSeen: lastSeen ? new Date(lastSeen) : null } }));
      if (lastSeen) setUsersMap(prev => ({ ...prev, [userId]: { ...prev[userId], lastSeen: new Date(lastSeen) } }));
    });

    socket.on("new_message", msg => {
      const curRoom = activeRoomRef.current;
      if (msg.senderId !== currentUser._id) {
        socket.emit("message_delivered", { messageId: msg._id });
      }
      if (msg.roomId === curRoom?._id) {
        setMessages(prev => [...prev, {
          ...msg,
          deliveredCount: msg.deliveredTo?.length || 0,
          readCount: msg.readBy?.length || 0,
          reactions: msg.reactions || [],
        }]);
        if (msg.senderId !== currentUser._id) {
          socket.emit("mark_read", { messageIds: [msg._id], roomId: msg.roomId });
        }
      } else {
        setMyRooms(prev => prev.map(r =>
          r._id === msg.roomId ? { ...r, unreadCount: (r.unreadCount || 0) + 1 } : r
        ));
      }
      setMyRooms(prev =>
        prev.map(r => r._id === msg.roomId ? { ...r, lastActivity: new Date(msg.createdAt) } : r)
          .sort((a, b) => new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0))
      );
    });

    socket.on("typing_users", ({ roomId, typing }) => {
      if (roomId === activeRoomRef.current?._id) setTypingUsers(typing);
    });

    socket.on("room_history", history => {
      setMessages(history.map(m => ({
        ...m,
        deliveredCount: m.deliveredTo?.length || 0,
        readCount: m.readBy?.length || 0,
        reactions: m.reactions || [],
      })));
      const curRoom = activeRoomRef.current;
      if (!curRoom) return;
      const undeliveredIds = history.filter(m => m.senderId !== currentUser._id && !m.deliveredTo?.includes(currentUser._id)).map(m => m._id);
      const unreadIds = history.filter(m => m.senderId !== currentUser._id && !m.readBy?.includes(currentUser._id)).map(m => m._id);
      if (undeliveredIds.length) socket.emit("mark_delivered", { messageIds: undeliveredIds, roomId: curRoom._id });
      if (unreadIds.length) {
        socket.emit("mark_read", { messageIds: unreadIds, roomId: curRoom._id });
        setMyRooms(prev => prev.map(r => r._id === curRoom._id ? { ...r, unreadCount: 0 } : r));
      }
    });

    socket.on("message_receipt_updated", ({ messageId, deliveredCount, readCount }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, deliveredCount, readCount } : m));
    });

    socket.on("messages_receipts_updated", ({ updatedMessages }) => {
      setMessages(prev => prev.map(m => {
        const u = updatedMessages.find(u => u.messageId === m._id);
        return u ? { ...m, deliveredCount: u.deliveredCount, readCount: u.readCount } : m;
      }));
    });

    socket.on("reaction_updated", ({ messageId, reactions }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m));
    });

    socket.on("message_readers", ({ messageId, readers }) => {
      setReaderList(readers);
      setShowReaderModal(true);
    });

    socket.on("room_updated", updatedRoom => {
      setMyRooms(prev => prev.map(r =>
        r._id === updatedRoom._id ? { ...updatedRoom, memberCount: updatedRoom.members?.length || 1 } : r
      ));
      if (activeRoomRef.current?._id === updatedRoom._id)
        setActiveRoom({ ...updatedRoom, memberCount: updatedRoom.members?.length || 1 });
    });

    socket.on("user_updated", data => {
      setUsersMap(prev => ({ ...prev, [data._id]: { ...prev[data._id], ...data } }));
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [currentUser?._id]);

  const getSocket = () => socketRef.current;

  const joinRoomLogic = async room => {
    if (!room) return;
    const socket = getSocket();
    socket?.emit("join_room", { roomId: room._id });
    setActiveRoom({ ...room, memberCount: room.members?.length || 1 });
    const history = await getMessagesByRoom(room._id);
    setMessages(history);
    setTypingUsers([]);
    // Only refresh user's own rooms if they are a member (app admins may not be members)
    if (currentUser?.role !== "admin" || room.members?.some(m => (m._id || m)?.toString() === currentUser?._id)) {
      const updatedRooms = await getUserRooms(currentUser._id);
      setMyRooms(updatedRooms.map(r => ({ ...r, memberCount: r.members?.length || 1 })));
    }
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleSelectUser = async targetUser => {
    if (targetUser._id === currentUser._id) return;
    const room = await createOrGetRoom({ members: [currentUser._id, targetUser._id], type: "private" });
    if (room) { joinRoomLogic(room); setShowMembersModal(false); }
  };

  const handleJoinGroup = async (name, imageUrl = "") => {
    if (!name.trim()) return;
    const room = await createOrGetRoom({ name, members: [currentUser._id], type: "group", profileImage: imageUrl });
    if (room) joinRoomLogic(room);
  };

  const handleUpdateGroup = async (roomId, name, imageUrl) => {
    try {
      const updatedRoom = await updateRoom(roomId, { name, profileImage: imageUrl });
      if (updatedRoom) {
        setMyRooms(prev => prev.map(r =>
          r._id === roomId ? { ...updatedRoom, memberCount: updatedRoom.members?.length || 1 } : r
        ));
        if (activeRoom?._id === roomId)
          setActiveRoom({ ...updatedRoom, memberCount: updatedRoom.members?.length || 1 });
        getSocket()?.emit("room_updated", updatedRoom);
      }
    } catch (err) { console.error("Update group error:", err); }
  };

  const handleLeaveConfirm = () => {
    if (!activeRoom || activeRoom.type !== "group") return;
    getSocket()?.emit("leave_room", { roomId: activeRoom._id, userId: currentUser._id });
    setActiveRoom(null); setMessages([]); setTypingUsers([]);
    getUserRooms(currentUser._id).then(rooms =>
      setMyRooms(rooms.map(r => ({ ...r, memberCount: r.members?.length || 1 })))
    );
    setShowLeaveModal(false);
  };

  const handleDeleteGroup = async () => {
    if (!activeRoom) return;
    try {
      await deleteRoom(activeRoom._id);
      setMyRooms(prev => prev.filter(r => r._id !== activeRoom._id));
      setActiveRoom(null); setMessages([]); setTypingUsers([]);
    } catch (err) { alert(err.message); }
    setConfirmAction(null);
  };

  const handleClearChat = async () => {
    if (!activeRoom) return;
    try {
      await clearRoomChat(activeRoom._id);
      setMessages([]);
    } catch (err) { alert(err.message); }
    setConfirmAction(null);
  };

  const handleToggleAdminOnly = async () => {
    if (!activeRoom) return;
    try {
      const updated = await toggleAdminOnlySend(activeRoom._id);
      const updatedRoom = { ...updated, memberCount: updated.members?.length || 1 };
      setActiveRoom(updatedRoom);
      setMyRooms(prev => prev.map(r => r._id === updatedRoom._id ? updatedRoom : r));
      getSocket()?.emit("room_updated", updated);
    } catch (err) { alert(err.message); }
  };

  const handleRoomUpdated = (updatedRoom) => {
    const room = { ...updatedRoom, memberCount: updatedRoom.members?.length || 1 };
    setMyRooms(prev => prev.map(r => r._id === room._id ? room : r));
    if (activeRoom?._id === room._id) setActiveRoom(room);
    getSocket()?.emit("room_updated", updatedRoom);
  };

  const handleLogout = async () => {
    getSocket()?.disconnect();
    await logout();
  };

  const handleRequestReaders = messageId => getSocket()?.emit("get_message_readers", { messageId });
  const handleAddReaction    = (messageId, emoji) => getSocket()?.emit("add_reaction", { messageId, emoji });

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "#09091a" }}>

      {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}
      {showJoinModal && <JoinModal onJoin={handleJoinGroup} close={() => setShowJoinModal(false)} />}
      {showLeaveModal && <LeaveRoomModal onConfirm={handleLeaveConfirm} close={() => setShowLeaveModal(false)} />}
      {showEditGroupModal && activeRoom && (
        <EditGroupModal room={activeRoom} onUpdate={handleUpdateGroup} close={() => setShowEditGroupModal(false)} />
      )}
      {showReaderModal && <ReaderListModal readers={readerList} onClose={() => setShowReaderModal(false)} />}
      {showMembersModal && activeRoom && (
        <GroupMembersModal
          room={activeRoom}
          usersMap={usersMap}
          currentUser={currentUser}
          allUsers={allUsers.filter(u => u._id !== currentUser?._id)}
          onClose={() => setShowMembersModal(false)}
          onUserClick={handleSelectUser}
          onRoomUpdated={handleRoomUpdated}
        />
      )}
      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel || "Confirm"}
          danger={confirmAction.danger}
          onConfirm={confirmAction.onConfirm}
          onClose={() => setConfirmAction(null)}
        />
      )}

      <Header
        currentUser={currentUser}
        onJoinClick={() => setShowJoinModal(true)}
        onEditClick={() => setShowEditProfile(true)}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        sidebarOpen={sidebarOpen}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)", zIndex: 20,
            }}
            className="md:hidden"
          />
        )}

        <Sidebar
          allUsers={allUsers.filter(u => u._id !== currentUser?._id)}
          onlineMap={onlineMap}
          usersMap={usersMap}
          rooms={myRooms}
          onSelectUser={handleSelectUser}
          onSelectRoom={joinRoomLogic}
          activeRoomId={activeRoom?._id}
          currentUserId={currentUser?._id}
          onEditGroup={room => { setActiveRoom(room); setShowEditGroupModal(true); }}
          isOpen={sidebarOpen}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <ChatDashboard
            activeRoom={activeRoom}
            messages={messages}
            currentUser={currentUser}
            socket={getSocket()}
            typingUsers={typingUsers}
            usersMap={usersMap}
            onlineMap={onlineMap}
            onRequestReaders={handleRequestReaders}
            onAddReaction={handleAddReaction}
            onShowMembers={() => setShowMembersModal(true)}
            onLeaveGroup={() => setShowLeaveModal(true)}
            onEditGroup={() => setShowEditGroupModal(true)}
            onDeleteGroup={() => setConfirmAction({
              title: "Delete Group",
              message: "This will permanently delete the group and all its messages. This cannot be undone.",
              confirmLabel: "Delete Group",
              danger: true,
              onConfirm: handleDeleteGroup,
            })}
            onClearChat={() => setConfirmAction({
              title: "Clear Chat",
              message: "This will permanently delete all messages in this group. This cannot be undone.",
              confirmLabel: "Clear Chat",
              danger: true,
              onConfirm: handleClearChat,
            })}
            onToggleAdminOnly={handleToggleAdminOnly}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
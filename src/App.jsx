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
import { getAllUsers, getUserRooms, getMessagesByRoom, createOrGetRoom, updateRoom, toggleAdminOnlySend, deleteRoom, clearRoomChat } from "./api/api";
import { useAuth } from "./context/AuthContext";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function App() {
  const { currentUser, logout } = useAuth();
  const socketRef = useRef(null);

  const [allUsers, setAllUsers]     = useState([]);
  const [usersMap, setUsersMap]     = useState({});
  const [onlineMap, setOnlineMap]   = useState({});
  const [myRooms, setMyRooms]       = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages]     = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const [showEditProfile, setShowEditProfile]     = useState(false);
  const [showJoinModal, setShowJoinModal]         = useState(false);
  const [showLeaveModal, setShowLeaveModal]       = useState(false);
  const [showEditGroup, setShowEditGroup]         = useState(false);
  const [showReaderModal, setShowReaderModal]     = useState(false);
  const [readerList, setReaderList]               = useState([]);
  const [showMembersModal, setShowMembersModal]   = useState(false);
  const [sidebarOpen, setSidebarOpen]             = useState(false);
  const [confirmAction, setConfirmAction]         = useState(null);

  const activeRoomRef = useRef(activeRoom);
  useEffect(() => { activeRoomRef.current = activeRoom; }, [activeRoom]);

  useEffect(() => {
    if (!currentUser) return;
    const socket = io(SOCKET_URL, { withCredentials: true, auth: { token: "" } });
    socketRef.current = socket;

    const loadData = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(users);
        const uMap = {};
        users.forEach(u => { uMap[u._id] = { nickName: u.nickName || u.name, lastSeen: u.lastSeen, profileImage: u.profileImage || "", fullName: u.name }; });
        setUsersMap(uMap);
        const rooms = await getUserRooms(currentUser._id);
        setMyRooms(rooms.map(r => ({ ...r, memberCount: r.members?.length || 1 })));
      } catch (err) { console.error("loadData error:", err); }
    };
    loadData();

    socket.on("online_list", ids => { const m = {}; ids.forEach(id => (m[id] = { status: "online" })); setOnlineMap(m); });
    socket.on("user_status", ({ userId, status, lastSeen }) => {
      setOnlineMap(prev => ({ ...prev, [userId]: { status, lastSeen: lastSeen ? new Date(lastSeen) : null } }));
      if (lastSeen) setUsersMap(prev => ({ ...prev, [userId]: { ...prev[userId], lastSeen: new Date(lastSeen) } }));
    });

    socket.on("new_message", msg => {
      const cur = activeRoomRef.current;
      if (msg.senderId !== currentUser._id) socket.emit("message_delivered", { messageId: msg._id });
      if (msg.roomId === cur?._id) {
        setMessages(prev => [...prev, { ...msg, deliveredCount: msg.deliveredTo?.length || 0, readCount: msg.readBy?.length || 0, reactions: msg.reactions || [] }]);
        if (msg.senderId !== currentUser._id) socket.emit("mark_read", { messageIds: [msg._id], roomId: msg.roomId });
      } else {
        setMyRooms(prev => prev.map(r => r._id === msg.roomId ? { ...r, unreadCount: (r.unreadCount || 0) + 1 } : r));
      }
      setMyRooms(prev => prev.map(r => r._id === msg.roomId ? { ...r, lastActivity: new Date(msg.createdAt) } : r).sort((a, b) => new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0)));
    });

    socket.on("typing_users", ({ roomId, typing }) => { if (roomId === activeRoomRef.current?._id) setTypingUsers(typing); });

    socket.on("room_history", history => {
      setMessages(history.map(m => ({ ...m, deliveredCount: m.deliveredTo?.length || 0, readCount: m.readBy?.length || 0, reactions: m.reactions || [] })));
      const cur = activeRoomRef.current; if (!cur) return;
      const undelivered = history.filter(m => m.senderId !== currentUser._id && !m.deliveredTo?.includes(currentUser._id)).map(m => m._id);
      const unread      = history.filter(m => m.senderId !== currentUser._id && !m.readBy?.includes(currentUser._id)).map(m => m._id);
      if (undelivered.length) socket.emit("mark_delivered", { messageIds: undelivered, roomId: cur._id });
      if (unread.length) { socket.emit("mark_read", { messageIds: unread, roomId: cur._id }); setMyRooms(prev => prev.map(r => r._id === cur._id ? { ...r, unreadCount: 0 } : r)); }
    });

    socket.on("message_receipt_updated", ({ messageId, deliveredCount, readCount }) => { setMessages(prev => prev.map(m => m._id === messageId ? { ...m, deliveredCount, readCount } : m)); });
    socket.on("messages_receipts_updated", ({ updatedMessages }) => { setMessages(prev => prev.map(m => { const u = updatedMessages.find(u => u.messageId === m._id); return u ? { ...m, deliveredCount: u.deliveredCount, readCount: u.readCount } : m; })); });
    socket.on("reaction_updated", ({ messageId, reactions }) => { setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m)); });
    socket.on("message_readers", ({ readers }) => { setReaderList(readers); setShowReaderModal(true); });
    socket.on("room_updated", updated => {
      const r = { ...updated, memberCount: updated.members?.length || 1 };
      setMyRooms(prev => prev.map(room => room._id === r._id ? r : room));
      if (activeRoomRef.current?._id === r._id) setActiveRoom(r);
    });
    socket.on("user_updated", data => { setUsersMap(prev => ({ ...prev, [data._id]: { ...prev[data._id], ...data } })); });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [currentUser?._id]);

  const getSocket = () => socketRef.current;

  const joinRoomLogic = async room => {
    if (!room) return;
    getSocket()?.emit("join_room", { roomId: room._id });
    setActiveRoom({ ...room, memberCount: room.members?.length || 1 });
    const history = await getMessagesByRoom(room._id);
    setMessages(history); setTypingUsers([]);
    if (currentUser?.role !== "admin" || room.members?.some(m => (m._id || m)?.toString() === currentUser?._id)) {
      const rooms = await getUserRooms(currentUser._id);
      setMyRooms(rooms.map(r => ({ ...r, memberCount: r.members?.length || 1 })));
    }
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleSelectUser = async user => {
    if (user._id === currentUser._id) return;
    const room = await createOrGetRoom({ members: [currentUser._id, user._id], type: "private" });
    if (room) { joinRoomLogic(room); setShowMembersModal(false); }
  };

  const handleJoinGroup = async (name, imageUrl = "") => {
    if (!name.trim()) return;
    const room = await createOrGetRoom({ name, members: [currentUser._id], type: "group", profileImage: imageUrl });
    if (room) joinRoomLogic(room);
  };

  const handleUpdateGroup = async (roomId, name, imageUrl) => {
    try {
      const updated = await updateRoom(roomId, { name, profileImage: imageUrl });
      if (updated) {
        const r = { ...updated, memberCount: updated.members?.length || 1 };
        setMyRooms(prev => prev.map(room => room._id === roomId ? r : room));
        if (activeRoom?._id === roomId) setActiveRoom(r);
        getSocket()?.emit("room_updated", updated);
      }
    } catch (err) { console.error("Update group error:", err); }
  };

  const handleLeaveConfirm = () => {
    if (!activeRoom || activeRoom.type !== "group") return;
    getSocket()?.emit("leave_room", { roomId: activeRoom._id, userId: currentUser._id });
    setActiveRoom(null); setMessages([]); setTypingUsers([]);
    getUserRooms(currentUser._id).then(rooms => setMyRooms(rooms.map(r => ({ ...r, memberCount: r.members?.length || 1 }))));
    setShowLeaveModal(false);
  };

  const handleDeleteGroup = async () => {
    if (!activeRoom) return;
    try { await deleteRoom(activeRoom._id); setMyRooms(prev => prev.filter(r => r._id !== activeRoom._id)); setActiveRoom(null); setMessages([]); setTypingUsers([]); }
    catch (err) { alert(err.message); }
    setConfirmAction(null);
  };

  const handleClearChat = async () => {
    if (!activeRoom) return;
    try { await clearRoomChat(activeRoom._id); setMessages([]); }
    catch (err) { alert(err.message); }
    setConfirmAction(null);
  };

  const handleToggleAdminOnly = async () => {
    if (!activeRoom) return;
    try {
      const updated = await toggleAdminOnlySend(activeRoom._id);
      const r = { ...updated, memberCount: updated.members?.length || 1 };
      setActiveRoom(r); setMyRooms(prev => prev.map(room => room._id === r._id ? r : room));
      getSocket()?.emit("room_updated", updated);
    } catch (err) { alert(err.message); }
  };

  const handleRoomUpdated = updated => {
    const r = { ...updated, memberCount: updated.members?.length || 1 };
    setMyRooms(prev => prev.map(room => room._id === r._id ? r : room));
    if (activeRoom?._id === r._id) setActiveRoom(r);
    getSocket()?.emit("room_updated", updated);
  };

  return (
    <div className="app-shell">
      {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}
      {showJoinModal   && <JoinModal onJoin={handleJoinGroup} close={() => setShowJoinModal(false)} />}
      {showLeaveModal  && <LeaveRoomModal onConfirm={handleLeaveConfirm} close={() => setShowLeaveModal(false)} />}
      {showEditGroup && activeRoom && <EditGroupModal room={activeRoom} onUpdate={handleUpdateGroup} close={() => setShowEditGroup(false)} />}
      {showReaderModal && <ReaderListModal readers={readerList} onClose={() => setShowReaderModal(false)} />}
      {showMembersModal && activeRoom && (
        <GroupMembersModal room={activeRoom} usersMap={usersMap} currentUser={currentUser}
          allUsers={allUsers.filter(u => u._id !== currentUser?._id)}
          onClose={() => setShowMembersModal(false)} onUserClick={handleSelectUser} onRoomUpdated={handleRoomUpdated} />
      )}
      {confirmAction && (
        <ConfirmModal title={confirmAction.title} message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel || "Confirm"} danger={confirmAction.danger}
          onConfirm={confirmAction.onConfirm} onClose={() => setConfirmAction(null)} />
      )}

      <Header currentUser={currentUser} onJoinClick={() => setShowJoinModal(true)}
        onEditClick={() => setShowEditProfile(true)} onLogout={async () => { getSocket()?.disconnect(); await logout(); }}
        onToggleSidebar={() => setSidebarOpen(p => !p)} sidebarOpen={sidebarOpen} />

      <div className="app-body">
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 20 }}
            className="md:hidden" />
        )}

        <Sidebar allUsers={allUsers.filter(u => u._id !== currentUser?._id)} onlineMap={onlineMap} usersMap={usersMap}
          rooms={myRooms} onSelectUser={handleSelectUser} onSelectRoom={joinRoomLogic}
          activeRoomId={activeRoom?._id} currentUserId={currentUser?._id}
          onEditGroup={room => { setActiveRoom(room); setShowEditGroup(true); }} isOpen={sidebarOpen} />

        <div className="app-main">
          <ChatDashboard activeRoom={activeRoom} messages={messages} currentUser={currentUser}
            socket={getSocket()} typingUsers={typingUsers} usersMap={usersMap} onlineMap={onlineMap}
            onRequestReaders={id => getSocket()?.emit("get_message_readers", { messageId: id })}
            onAddReaction={(id, emoji) => getSocket()?.emit("add_reaction", { messageId: id, emoji })}
            onShowMembers={() => setShowMembersModal(true)}
            onLeaveGroup={() => setShowLeaveModal(true)}
            onEditGroup={() => setShowEditGroup(true)}
            onDeleteGroup={() => setConfirmAction({ title: "Delete Group", message: "This will permanently delete the group and all its messages.", confirmLabel: "Delete Group", danger: true, onConfirm: handleDeleteGroup })}
            onClearChat={() => setConfirmAction({ title: "Clear Chat", message: "This will permanently delete all messages in this group.", confirmLabel: "Clear Chat", danger: true, onConfirm: handleClearChat })}
            onToggleAdminOnly={handleToggleAdminOnly} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
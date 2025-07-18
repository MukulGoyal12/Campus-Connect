import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSocket } from "../provider/SocketProvider";
import APICalling from "../APICalling";
import { Link } from "react-router-dom";

const Inbox = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const socket = useSocket();
  const { user: currentUser } = APICalling();

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API}/api/users`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        });
        setUsers(res.data.users);
        setFilteredUsers(res.data.users); // Initialize filtered users
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Fetch unread message counts
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API}/api/messages/unread-counts`,
          {
            withCredentials: true,
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
              "Content-Type": "application/json",
            },
          }
        );
        const counts = {};
        res.data.unreadCounts.forEach((item) => {
          counts[item._id] = item.count;
        });
        setUnreadCounts(counts);
      } catch (err) {
        console.error("Error fetching unread counts:", err);
      }
    };
    if (currentUser) fetchUnreadCounts();
  }, [currentUser]);

  // Socket join room
  useEffect(() => {
    if (currentUser && socket) {
      socket.emit("join_room", currentUser._id);
    }
  }, [currentUser, socket]);

  // Receive message via socket
  useEffect(() => {
    if (!socket) return;

    const handleReceive = async (message) => {
      if (
        selectedUser &&
        (message.sender === selectedUser._id ||
          message.receiver === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, message]);
        if (message.sender === selectedUser._id) {
          await axios.put(
            `${import.meta.env.VITE_API}/api/messages/mark-read/${
              selectedUser._id
            }`,
            {
              withCredentials: true,
              headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
                "Content-Type": "application/json",
              },
            }
          );
        }
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.sender]: (prev[message.sender] || 0) + 1,
        }));
      }
    };

    socket.on("receive_message", handleReceive);
    socket.on("unread_count_update", (data) => {
      setUnreadCounts((prev) => ({
        ...prev,
        [data.senderId]: data.count,
      }));
    });

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("unread_count_update");
    };
  }, [socket, selectedUser, currentUser]);

  // Fetch chat messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser || !currentUser) return;

      setLoading(true);
      socket.emit("join_chat", { otherUserId: selectedUser._id });
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API}/api/messages/${currentUser.user._id}/${
            selectedUser._id
          }`,
          {
            withCredentials: true,
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
              "Content-Type": "application/json",
            },
          }
        );
        setMessages(res.data.messages);

        await axios.put(
          `${import.meta.env.VITE_API}/api/messages/mark-read/${
            selectedUser._id
          }`,{},
          {
            withCredentials: true,
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
              "Content-Type": "application/json",
            },
          }
        );
        setUnreadCounts((prev) => ({ ...prev, [selectedUser._id]: 0 }));
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [selectedUser, currentUser, socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) socket.emit("leave_chat");
    };
  }, [socket]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !currentUser) return;

    const msg = {
      senderId: currentUser.user._id,
      receiverId: selectedUser._id,
      message: newMessage,
    };

    try {
      socket.emit("send_message", msg);
      setMessages((prev) => [
        ...prev,
        {
          ...msg,
          _id: Date.now().toString(),
          createdAt: new Date(),
        },
      ]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="h-screen flex flex-col sm:flex-row">
      {/* Sidebar Users */}
      <div
        className={`sm:w-1/3 bg-white border-r overflow-y-auto ${
          selectedUser ? "hidden sm:block" : "block"
        }`}
      >
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold mb-3">💬 Chats</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedUser?._id === user._id ? "bg-blue-50" : ""
              }`}
            >
              <Link
                to={`/user/${user._id}`}
                className="flex items-center gap-2"
              >
                <img
                  src={`${import.meta.env.VITE_API}/images/uploads/${user.profilepic}`}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-300 ring-offset-2"
                />
              </Link>
              <div className="ml-3 flex-1">
                <h3 className="font-semibold text-sm">{user.name}</h3>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              {unreadCounts[user._id] > 0 && (
                <div className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {unreadCounts[user._id]}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No users found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col relative ${
          !selectedUser ? "hidden sm:flex" : "flex"
        }`}
      >
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b flex items-center sticky top-0 z-20">
              <button
                onClick={() => setSelectedUser(null)}
                className="sm:hidden text-lg mr-3"
              >
                👈🏻
              </button>
              <Link
                to={`/user/${selectedUser._id}`}
                className="flex items-center gap-2"
              >
                <img
                  src={`${import.meta.env.VITE_API}/images/uploads/${selectedUser.profilepic}`}
                  alt={selectedUser.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-300 ring-offset-2"
                />
              </Link>
              <div className="ml-3">
                <h2 className="font-semibold text-sm">{selectedUser.name}</h2>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-[90px]">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full" />
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.sender === currentUser.user._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-sm px-3 py-2 rounded-lg text-sm ${
                        message.sender === currentUser.user._id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p>{message.message}</p>
                      <p className="text-xs mt-1 text-right opacity-70">
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Fixed */}
            <div className="fixed bottom-[56px] sm:bottom-0 left-0 right-0 bg-white p-3 border-t flex items-center space-x-2 z-30 sm:static">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:bg-gray-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 hidden sm:flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-lg font-semibold text-gray-600 mb-1">
                Select a chat to start messaging
              </h2>
              <p className="text-sm text-gray-500">
                Choose from your conversations
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;

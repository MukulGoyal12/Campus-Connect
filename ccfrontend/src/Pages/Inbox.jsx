import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSocket } from "../provider/SocketProvider";
import APICalling from "../APICalling";
import { Link } from "react-router-dom";

const Inbox = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const socket = useSocket();
  const { user: currentUser } = APICalling();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/users", {
          withCredentials: true,
        });
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/messages/unread-counts",
          {
            withCredentials: true,
          }
        );
        const countsMap = {};
        response.data.unreadCounts.forEach((item) => {
          countsMap[item._id] = item.count;
        });
        setUnreadCounts(countsMap);
      } catch (error) {
        console.error("Error fetching unread counts:", error);
      }
    };
    if (currentUser) {
      fetchUnreadCounts();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && socket) {
      socket.emit("join_room", currentUser._id);
    }
  }, [currentUser, socket]);

  useEffect(() => {
    if (socket) {
      socket.on("receive_message", (message) => {
        if (
          selectedUser &&
          (message.sender === selectedUser._id ||
            message.receiver === selectedUser._id)
        ) {
          if (message.sender !== currentUser.user._id) {
            setMessages((prev) => [...prev, message]);
            if (message.sender === selectedUser._id) {
              axios
                .put(
                  `http://localhost:3000/api/messages/mark-read/${selectedUser._id}`,
                  {},
                  { withCredentials: true }
                )
                .catch(console.error);
            }
          }
        }
        if (
          message.sender !== currentUser?.user._id &&
          (!selectedUser || message.sender !== selectedUser._id)
        ) {
          setUnreadCounts((prev) => ({
            ...prev,
            [message.sender]: (prev[message.sender] || 0) + 1,
          }));
        }
      });

      socket.on("unread_count_update", (data) => {
        setUnreadCounts((prev) => ({
          ...prev,
          [data.senderId]: data.count,
        }));
      });

      return () => {
        socket.off("receive_message");
        socket.off("unread_count_update");
      };
    }
  }, [socket, selectedUser, currentUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser && currentUser) {
        setLoading(true);
        socket.emit("join_chat", { otherUserId: selectedUser._id });
        try {
          const response = await axios.get(
            `http://localhost:3000/api/messages/${currentUser.user._id}/${selectedUser._id}`,
            {
              withCredentials: true,
            }
          );
          setMessages(response.data.messages);
          await axios.put(
            `http://localhost:3000/api/messages/mark-read/${selectedUser._id}`,
            {},
            { withCredentials: true }
          );
          setUnreadCounts((prev) => ({ ...prev, [selectedUser._id]: 0 }));
        } catch (error) {
          console.error("Error fetching messages:", error);
        } finally {
          setLoading(false);
        }
      } else if (socket) {
        socket.emit("leave_chat");
      }
    };
    fetchMessages();
  }, [selectedUser, currentUser, socket]);

  useEffect(() => {
    return () => {
      if (socket) socket.emit("leave_chat");
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !currentUser) return;
    const messageData = {
      senderId: currentUser.user._id,
      receiverId: selectedUser._id,
      message: newMessage,
    };
    try {
      socket.emit("send_message", messageData);
      const tempMessage = {
        ...messageData,
        _id: Date.now().toString(),
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="h-screen bg-gray-100 flex flex-col sm:flex-row">
      {/* User List (Mobile hidden if chat is open) */}
      <div
        className={`sm:w-1/3 bg-white border-r border-gray-300 overflow-y-auto ${
          selectedUser ? "hidden sm:block" : "block"
        } `}
      >
        <div className="p-4 border-b border-gray-300">
          <h1 className="text-xl font-bold text-gray-800">💬 Chats</h1>
        </div>
        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`flex items-center p-4 border-b cursor-pointer hover:bg-gray-50 ${
              selectedUser?._id === user._id ? "bg-blue-50 border-blue-200" : ""
            }`}
          >
            <Link
                to={`/user/${user._id}`}
                className="flex items-center gap-2"
              >
            <img
              src={`http://localhost:3000/images/uploads/${user.profilepic}`}
              alt={user.name}
              className="w-9 h-9 rounded-full mr-3 object-cover ring-2 ring-violet-300 ring-offset-2 ring-offset-white"
            />
            </Link>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">
                {user.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            {unreadCounts[user._id] > 0 && (
              <div className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {unreadCounts[user._id]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div
        className={`flex-1 flex flex-col ${
          !selectedUser ? "hidden sm:flex" : "flex"
        }`}
      >
        {selectedUser ? (
          <>
            <div className="bg-white p-4 border-b flex items-center">
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
                  src={`http://localhost:3000/images/uploads/${selectedUser.profilepic}`}
                  alt={selectedUser.name}
                  className="w-9 h-9 rounded-full mr-3 object-cover ring-2 ring-violet-300 ring-offset-2 ring-offset-white"
                />
              </Link>
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">
                  {selectedUser.name}
                </h2>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
            <div className="bg-white p-3 border-t flex items-center space-x-2">
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

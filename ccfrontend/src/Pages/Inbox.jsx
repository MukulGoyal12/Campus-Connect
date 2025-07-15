import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSocket } from "../provider/SocketProvider";
import APICalling from "../APICalling";

const Inbox = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const socket = useSocket();
  const {user:currentUser} = APICalling();

  // Fetch all users for chat list
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

  // Fetch unread counts
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/messages/unread-counts", {
          withCredentials: true,
        });
        
        const countsMap = {};
        response.data.unreadCounts.forEach(item => {
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
        // If the message is for the currently selected chat, add it to messages
        if (
          selectedUser &&
          (message.sender === selectedUser._id || message.receiver === selectedUser._id)
        ) {
          setMessages((prev) => [...prev, message]);
          
          // If it's from the selected user, mark it as read immediately
          if (message.sender === selectedUser._id) {
            axios.put(
              `http://localhost:3000/api/messages/mark-read/${selectedUser._id}`,
              {},
              { withCredentials: true }
            ).catch(console.error);
          }
        }
        
        // Update unread count for the sender (only if not currently chatting with them)
        if (message.sender !== currentUser?.user._id && 
            (!selectedUser || message.sender !== selectedUser._id)) {
          setUnreadCounts(prev => ({
            ...prev,
            [message.sender]: (prev[message.sender] || 0) + 1
          }));
        }
      });

      socket.on("unread_count_update", (data) => {
        setUnreadCounts(prev => ({
          ...prev,
          [data.senderId]: data.count
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
        
        // Notify server that user is now chatting with this person
        socket.emit("join_chat", { otherUserId: selectedUser._id });
        
        try {
          console.log(currentUser.user._id, selectedUser._id);
          
          const response = await axios.get(
            `http://localhost:3000/api/messages/${currentUser.user._id}/${selectedUser._id}`,
            { withCredentials: true }
          );
          setMessages(response.data.messages);

          // Mark messages as read when opening chat
          await axios.put(
            `http://localhost:3000/api/messages/mark-read/${selectedUser._id}`,
            {},
            { withCredentials: true }
          );

          // Update unread count to 0 for this user
          setUnreadCounts(prev => ({
            ...prev,
            [selectedUser._id]: 0
          }));

        } catch (error) {
          console.error("Error fetching messages:", error);
        } finally {
          setLoading(false);
        }
      } else if (socket) {
        // If no user is selected, leave current chat
        socket.emit("leave_chat");
      }
    };
    fetchMessages();
  }, [selectedUser, currentUser, socket]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (socket) {
        socket.emit("leave_chat");
      }
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Users List */}
      <div className="w-1/3 bg-white border-r border-gray-300">
        <div className="p-4 border-b border-gray-300">
          <h1 className="text-xl font-bold text-gray-800">💬 Chats</h1>
        </div>
        <div className="overflow-y-auto h-full">
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedUser?._id === user._id ? "bg-blue-50 border-blue-200" : ""
              }`}
            >
              <img
                src={`http://localhost:3000/images/uploads/${user.profilepic}`}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover mr-3"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              {unreadCounts[user._id] > 0 && (
                <div className="bg-green-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                  {unreadCounts[user._id]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b border-gray-300 flex items-center">
              <img
                src={`http://localhost:3000/images/uploads/${selectedUser.profilepic}`}
                alt={selectedUser.name}
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <div>
                <h2 className="font-semibold text-gray-900">{selectedUser.name}</h2>
                <p className="text-sm text-gray-500">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === currentUser.user._id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === currentUser.user._id
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white p-4 border-t border-gray-300">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                Select a chat to start messaging
              </h2>
              <p className="text-gray-500">
                Choose from your existing conversations on the left
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
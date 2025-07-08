import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useSocket } from "../provider/SocketProvider";
import { useLocation } from "react-router-dom";
import APICalling from "../APICalling";

const Inbox = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isRequestChat, setIsRequestChat] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [messageCount, setMessageCount] = useState(0);
  const [showOfferButtons, setShowOfferButtons] = useState(false);
  const messagesEndRef = useRef(null);
  const socket = useSocket();
  const currentUser = APICalling();
  const location = useLocation();
  const addUserTimeouts = useRef(new Map());

  const addUserToList = useCallback(async (userId) => {
    try {
      if (userId === currentUser?._id) return;
      
      if (addUserTimeouts.current.has(userId)) {
        clearTimeout(addUserTimeouts.current.get(userId));
      }
      
      const timeout = setTimeout(async () => {
        try {
          let shouldFetchUser = false;
          
          setUsers(prev => {
            if (prev.find(user => user._id === userId)) {
              return prev;
            }
            shouldFetchUser = true;
            return prev;
          });
          
          if (shouldFetchUser) {
            try {
              const response = await axios.get(`http://localhost:3000/api/user/${userId}`, {
                withCredentials: true,
              });
              
              if (response.data.user) {
                setUsers(currentUsers => {
                  if (currentUsers.find(user => user._id === userId)) {
                    return currentUsers;
                  }
                  
                  return [...currentUsers, {
                    _id: response.data.user._id,
                    name: response.data.user.name,
                    email: response.data.user.email,
                    profilepic: response.data.user.profilepic
                  }];
                });
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          }
        } catch (error) {
          console.error("Error in addUserToList:", error);
        } finally {
          addUserTimeouts.current.delete(userId);
        }
      }, 100);
      
      addUserTimeouts.current.set(userId, timeout);
    } catch (error) {
      console.error("Error in addUserToList:", error);
    }
  }, [currentUser]);
  
  // Fetch all users for chat list
  useEffect(() => {
    const initializeUserList = async () => {
      if (!currentUser) return;
      
      try {
        const response = await axios.get("http://localhost:3000/api/messages/conversations", {
          withCredentials: true,
        });
        
        const userIds = response.data.userIds || [];
        
        const userPromises = userIds.map(async (userId) => {
          try {
            const userResponse = await axios.get(`http://localhost:3000/api/user/${userId}`, {
              withCredentials: true,
            });
            return {
              _id: userResponse.data.user._id,
              name: userResponse.data.user.name,
              email: userResponse.data.user.email,
              profilepic: userResponse.data.user.profilepic
            };
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            return null;
          }
        });
        
        const users = await Promise.all(userPromises);
        const validUsers = users.filter(user => user !== null);
        setUsers(validUsers);
        
      } catch (error) {
        console.error("Error initializing user list:", error);
        setUsers([]);
      }
    };
    
    if (currentUser) {
      initializeUserList();
    }
  }, [currentUser]);

  useEffect(() => {
    const cleanupDuplicates = () => {
      setUsers(prev => {
        const uniqueUsers = [];
        const seenIds = new Set();
        
        for (const user of prev) {
          if (!seenIds.has(user._id)) {
            seenIds.add(user._id);
            uniqueUsers.push(user);
          }
        }
        
        return uniqueUsers.length !== prev.length ? uniqueUsers : prev;
      });
    };
    
    const timeoutId = setTimeout(cleanupDuplicates, 100);
    
    return () => clearTimeout(timeoutId);
  }, [users]);

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
    const handleAutoSelect = async () => {
      if (location.state?.selectUserId) {
        
        let userToSelect = users.find(user => user._id === location.state.selectUserId);
        
        if (!userToSelect) {
          
          await addUserToList(location.state.selectUserId);
          
          
          setTimeout(() => {
            const user = users.find(u => u._id === location.state.selectUserId);
            if (user) {
              setSelectedUser(user);
              
              if (location.state?.requestId) {
                setIsRequestChat(true);
                setRequestId(location.state.requestId);
                setMessageCount(0);
                setShowOfferButtons(false);
              }
              
              window.history.replaceState({}, document.title);
            }
          }, 200);
        } else {
          
          setSelectedUser(userToSelect);
          
          if (location.state?.requestId) {
            setIsRequestChat(true);
            setRequestId(location.state.requestId);
            setMessageCount(0);
            setShowOfferButtons(false);
          }
          
          window.history.replaceState({}, document.title);
        }
      }
    };
    
    if (location.state?.selectUserId && currentUser) {
      handleAutoSelect();
    }
  }, [location.state, users, currentUser, addUserToList]);

  useEffect(() => {
    if (currentUser && socket) {
      socket.emit("join_room", currentUser._id);
    }
  }, [currentUser, socket]);

  useEffect(() => {
    if (socket) {
      socket.on("receive_message", async (message) => {
          if (message.sender !== currentUser?._id) {
          await addUserToList(message.sender);
        }
        
        if (message.receiver !== currentUser?._id) {
          await addUserToList(message.receiver);
        }
        
        if (
          selectedUser &&
          (message.sender === selectedUser._id || message.receiver === selectedUser._id)
        ) {
          setMessages((prev) => [...prev, message]);
          
          if (message.sender === selectedUser._id) {
            axios.put(
              `http://localhost:3000/api/messages/mark-read/${selectedUser._id}`,
              {},
              { withCredentials: true }
            ).then(() => {
              
              socket.emit("messages_read", { 
                readerId: currentUser._id,
                senderId: selectedUser._id 
              });
            }).catch(console.error);
          }
        }
        
        if (message.sender !== currentUser?._id && 
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
  }, [socket, selectedUser, currentUser, addUserToList]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser && currentUser) {
        setLoading(true);
        
        socket.emit("join_chat", { otherUserId: selectedUser._id });
        
        try {
          const response = await axios.get(
            `http://localhost:3000/api/messages/${currentUser._id}/${selectedUser._id}`,
            { withCredentials: true }
          );
          setMessages(response.data.messages);

          await axios.put(
            `http://localhost:3000/api/messages/mark-read/${selectedUser._id}`,
            {},
            { withCredentials: true }
          );

          
          socket.emit("messages_read", { 
            readerId: currentUser._id,
            senderId: selectedUser._id 
          });

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
        
        socket.emit("leave_chat");
      }
    };
    fetchMessages();
  }, [selectedUser, currentUser, socket]);

  
  useEffect(() => {
    return () => {
      if (socket) {
        socket.emit("leave_chat");
      }
      
      addUserTimeouts.current.forEach(timeout => clearTimeout(timeout));
      addUserTimeouts.current.clear();
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

    
    if (isRequestChat && messageCount >= 5) {
      alert("Message limit reached! Please accept or reject the offer first.");
      return;
    }

    const messageData = {
      senderId: currentUser._id,
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
      
      
      if (isRequestChat) {
        const newCount = messageCount + 1;
        setMessageCount(newCount);
    
        if (newCount >= 5) {
          setShowOfferButtons(true);
        }
      }
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleAcceptOffer = async () => {
    try {
      await axios.put(`http://localhost:3000/api/request/accept/${requestId}`, {}, {
        withCredentials: true,
      });
      
      if (socket) {
        socket.emit("send_message", {
          senderId: currentUser._id,
          receiverId: selectedUser._id,
          message: "🎉 Offer accepted! Let's proceed with the request.",
        });
      }
      setIsRequestChat(false);
      setShowOfferButtons(false);
      setRequestId(null);
      setMessageCount(0);
      
      alert("Offer accepted successfully!");
    } catch (error) {
      console.error("Error accepting offer:", error);
      alert("Failed to accept offer. Please try again.");
    }
  };

  const handleRejectOffer = async () => {
    try {
      await axios.put(`http://localhost:3000/api/request/reject/${requestId}`, {}, {
        withCredentials: true,
      });
      
      if (socket) {
        socket.emit("send_message", {
          senderId: currentUser._id,
          receiverId: selectedUser._id,
          message: "❌ Offer rejected. Thank you for your time.",
        });
      }
      
      setIsRequestChat(false);
      setShowOfferButtons(false);
      setRequestId(null);
      setMessageCount(0);
      
      alert("Offer rejected.");
    } catch (error) {
      console.error("Error rejecting offer:", error);
      alert("Failed to reject offer. Please try again.");
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
            <div className="bg-white p-4 border-b border-gray-300 flex items-center justify-between">
              <div className="flex items-center">
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
              
              {isRequestChat && (
                <div className="text-center">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                    🤝 Request Chat
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Messages: {messageCount}/5
                  </div>
                </div>
              )}
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
                      message.sender === currentUser._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === currentUser._id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === currentUser._id
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

            {/* Offer Buttons */}
            {showOfferButtons && (
              <div className="bg-white p-4 border-t border-gray-300 flex justify-end space-x-2">
                <button
                  onClick={handleAcceptOffer}
                  className="bg-green-500 text-white rounded-full px-4 py-2 hover:bg-green-600 transition-colors"
                >
                  Accept Offer
                </button>
                <button
                  onClick={handleRejectOffer}
                  className="bg-red-500 text-white rounded-full px-4 py-2 hover:bg-red-600 transition-colors"
                >
                  Reject Offer
                </button>
              </div>
            )}
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
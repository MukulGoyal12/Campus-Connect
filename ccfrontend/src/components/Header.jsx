import { Link, useNavigate } from "react-router-dom";
import { FaGraduationCap, FaHome, FaSignOutAlt, FaShoppingCart, FaBell, FaEnvelope } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSocket } from "../provider/SocketProvider";

const Header = () => {
  const [user, setUser] = useState(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const navigate = useNavigate();
  const socket = useSocket();

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/user", {
        withCredentials: true,
      });
      setUser(res.data.user);
    } catch (err) {
      console.error("Fetch user error:", err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/messages/unread-counts", {
        withCredentials: true,
      });
      
      // Calculate total unread messages
      const total = response.data.unreadCounts.reduce((sum, item) => sum + item.count, 0);
      setTotalUnreadCount(total);
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/api/logout", {
        withCredentials: true,
      });
      navigate("/auth/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchUnreadCount();
  }, []);

  // Socket listeners for real-time unread count updates
  useEffect(() => {
    if (socket && user) {
      socket.emit("join_room", user._id);

      socket.on("receive_message", (message) => {
        // Only update count if message is not from current user
        if (message.sender !== user._id) {
          setTotalUnreadCount(prev => prev + 1);
        }
      });

      socket.on("unread_count_update", () => {
        // Refetch the complete unread count when there's an update
        fetchUnreadCount();
      });

      socket.on("messages_read", (data) => {
        // Decrease count when messages are marked as read
        if (data.count) {
          setTotalUnreadCount(prev => Math.max(0, prev - data.count));
        }
      });

      return () => {
        socket.off("receive_message");
        socket.off("unread_count_update");
        socket.off("messages_read");
      };
    }
  }, [socket, user]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2 hover:text-blue-600 transition">
          <FaGraduationCap className="text-blue-500 text-3xl" />
          <span className="text-lg font-semibold text-gray-800">Campus<span className="text-blue-600">Connect</span></span>
        </Link>

        <nav className="flex items-center gap-5">
          <Link to="/home" className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition">
            <FaHome className="text-2xl" />
            <span className="text-[11px]">Home</span>
          </Link>

          <Link to="/marketplace" className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition">
            <FaShoppingCart className="text-2xl" />
            <span className="text-[11px]">Market</span>
          </Link>

          <Link to="/inbox" className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition relative">
            <div className="relative">
              <FaEnvelope className="text-2xl" />
              {totalUnreadCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </div>
              )}
            </div>
            <span className="text-[11px]">Inbox</span>
          </Link>

          <Link to="/notifications" className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition">
            <FaBell className="text-2xl" />
            <span className="text-[11px]">Notifications</span>
          </Link>

          <Link to="/profile" className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition">
            <img
              src={`http://localhost:3000/images/uploads/${user?.profilepic}`}
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover border"
            />
            <span className="text-[11px]">Profile</span>
          </Link>

          <button onClick={handleLogout} className="flex flex-col items-center text-gray-700 hover:text-red-600 transition">
            <FaSignOutAlt className="text-2xl" />
            <span className="text-[11px]">Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

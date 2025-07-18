import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaSignOutAlt,
  FaShoppingCart,
  FaBell,
  FaEnvelope,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSocket } from "../provider/SocketProvider";
import Logo from "./Logo";

const Header = () => {
  const [user, setUser] = useState(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const navigate = useNavigate();
  const socket = useSocket();
  

  const fetchUser = async () => {
    try {
      const res= await axios
      .get(`${import.meta.env.VITE_API}/api/user`, {
        withCredentials:true,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },

      })
      setUser(res.data.user);
    } catch (err) {
      console.error("Fetch user error:", err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios
      .get(`${import.meta.env.VITE_API}/api/messages/unread-counts`, {
        withCredentials:true,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },

      })
      const total = response.data.unreadCounts.reduce(
        (sum, item) => sum + item.count,
        0
      );
      setTotalUnreadCount(total);
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios
      .get(`${import.meta.env.VITE_API}/api/logout`, {
        withCredentials:true,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },

      })
      navigate("/auth/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    // fetchUser();
    // fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (socket && user) {
      socket.emit("join_room", user._id);

      socket.on("receive_message", (message) => {
        if (message.sender !== user._id) {
          setTotalUnreadCount((prev) => prev + 1);
        }
      });

      socket.on("unread_count_update", fetchUnreadCount);

      socket.on("messages_read", (data) => {
        if (data.count) {
          setTotalUnreadCount((prev) => Math.max(0, prev - data.count));
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
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* ✅ Logo remains */}
        <Logo />

        {/* ✅ Desktop-only nav (mobile handled via MobileFooter) */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-5">
          <NavIcon to="/home" icon={<FaHome />} label="Home" />
          <NavIcon to="/marketplace" icon={<FaShoppingCart />} label="Market" />
          <NavIcon
            to="/inbox"
            icon={<FaEnvelope />}
            label="Inbox"
            unreadCount={totalUnreadCount}
          />
          <NavIcon
            to="/notifications"
            icon={<FaBell />}
            label="Notifications"
          />
          <NavIcon
            to="/profile"
            image={`default.jpeg`}
            label="Profile"
          />
          <button
            onClick={handleLogout}
            className="flex flex-col items-center text-gray-700 hover:text-red-600 transition-transform duration-300 hover:scale-105 hover:rotate-3"
          >
            <FaSignOutAlt className="text-2xl" />
            <span className="text-[11px]">Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

const NavIcon = ({ to, icon, label, unreadCount, image }) => (
  <Link
    to={to}
    className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-transform duration-300 hover:scale-105 hover:-rotate-3 relative"
  >
    <div className="relative">
      {image ? (
        <img
          src={image}
          alt="Profile"
          className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border"
        />
      ) : (
        <div className="text-xl md:text-2xl lg:text-xl">{icon}</div>
      )}
      {unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}
    </div>
    <span className="text-[10px] md:text-[11px] lg:text-[10px]">{label}</span>
  </Link>
);

export default Header;

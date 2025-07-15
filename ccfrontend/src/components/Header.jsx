import { Link, useNavigate } from "react-router-dom";
import { FaGraduationCap, FaHome, FaSignOutAlt, FaShoppingCart, FaBell, FaEnvelope } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
  }, []);

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

          <Link to="/inbox" className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition">
            <FaEnvelope className="text-2xl" />
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
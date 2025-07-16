import { Link } from "react-router-dom";
import {
  FaHome,
  FaShoppingCart,
  FaEnvelope,
  FaBell,
  FaUser,
} from "react-icons/fa";

const MobileFooter = ({ unreadCount = 0 }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t z-50 flex justify-around items-center py-2 md:hidden shadow-md">
      <FooterIcon to="/home" icon={<FaHome />} label="Home" />
      <FooterIcon to="/marketplace" icon={<FaShoppingCart />} label="Market" />
      <FooterIcon to="/inbox" icon={<FaEnvelope />} label="Inbox" badge={unreadCount} />
      <FooterIcon to="/notifications" icon={<FaBell />} label="Alerts" />
      <FooterIcon to="/profile" icon={<FaUser />} label="Profile" />
    </div>
  );
};

const FooterIcon = ({ to, icon, label, badge }) => (
  <Link
    to={to}
    className="flex flex-col items-center text-gray-600 hover:text-blue-600 relative"
  >
    <div className="relative text-xl">{icon}
      {badge > 0 && (
        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </div>
    <span className="text-[10px] mt-0.5">{label}</span>
  </Link>
);

export default MobileFooter;

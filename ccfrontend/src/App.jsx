import { Outlet, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header";
import HeaderSimple from "./components/HeaderSimple";
import { useEffect, useState } from "react";
import axios from "axios";
import MobileFooter from "./components/MobileFooter ";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("token");
  const authPaths = ["/auth/login", "/auth/register"];
  const showHeader = !authPaths.includes(location.pathname) && isAuthenticated;
  const showFooter = showHeader;

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
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
        const total = res.data.unreadCounts.reduce(
          (sum, item) => sum + item.count,
          0
        );
        setUnreadCount(total);
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };

    if (isAuthenticated) fetchUnread();
  }, [isAuthenticated]);

  return (
    <>
      {authPaths.includes(location.pathname)
        ? <HeaderSimple />
        : isAuthenticated && <Header />}

      {!isAuthenticated && !authPaths.includes(location.pathname)
        ? <Navigate to="/auth/login" />
        : <div className="overflow-hidden"><Outlet /></div>}

      {showFooter && <MobileFooter unreadCount={unreadCount} />}

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;

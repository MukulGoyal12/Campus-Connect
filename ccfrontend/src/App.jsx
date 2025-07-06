import { Outlet, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header";
import HeaderSimple from "./components/HeaderSimple";

function App() {
  const location = useLocation();
  const isAuthenticated = document.cookie.includes("token");


  const authPaths = ["/auth/login", "/auth/register"];

  return (
    <>
      {/* Show Header based on route */}
      {authPaths.includes(location.pathname)
        ? <HeaderSimple />
        : isAuthenticated && <Header />}

      {/* Protected routes ke liye redirect */}
      {!isAuthenticated && !authPaths.includes(location.pathname)
        ? <Navigate to="/auth/login" />
        : <Outlet />}
    </>
  );
}

export default App;

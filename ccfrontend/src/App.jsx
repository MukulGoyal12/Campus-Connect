import { Outlet, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header";
import HeaderSimple from "./components/HeaderSimple";
import MobileFooter from "./components/MobileFooter ";

function App() {
  const location = useLocation();
  const isAuthenticated = document.cookie.includes("token");
  const authPaths = ["/auth/login", "/auth/register"];

  const showHeader = !authPaths.includes(location.pathname) && isAuthenticated;
  const showFooter = showHeader; // same logic for footer as header

  return (
    <>
      {/* Header */}
      {authPaths.includes(location.pathname)
        ? <HeaderSimple />
        : isAuthenticated && <Header />}

      {/* Auth protection */}
      {!isAuthenticated && !authPaths.includes(location.pathname)
        ? <Navigate to="/auth/login" />
        : <Outlet />}

      {/* Footer only on authenticated pages */}
      {showFooter && <MobileFooter />}
    </>
  );
}


export default App;

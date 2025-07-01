import { Navigate } from "react-router-dom";
import { getCookie } from "../../utils/getCookie";

const ProtectedRoute = ({ children }) => {
  const token = getCookie("token");

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

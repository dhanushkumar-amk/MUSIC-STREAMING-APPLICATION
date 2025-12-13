import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  if (!token) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
}

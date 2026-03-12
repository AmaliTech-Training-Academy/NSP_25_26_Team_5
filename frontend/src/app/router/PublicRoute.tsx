import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext/AuthContext";

export default function PublicRoute() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

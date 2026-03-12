import { Outlet, useLocation, useNavigate } from "react-router";
import NavBar from "../NavBar/NavBar";
import { useAuth } from "../../../context/AuthContext/AuthContext";
import { isAdminRole } from "../../../features/auth/utils/role.utils";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const canAccessAnalytics = isAdminRole(user?.role);
  const navBarVariant = location.pathname.startsWith("/analytics")
    ? "analytics"
    : "default";

  const handleAnalyticsNavigate = () => {
    navigate("/analytics");
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <NavBar
        user={user ? { name: user.name, email: user.email } : undefined}
        showAnalytics={canAccessAnalytics}
        variant={navBarVariant}
        onAnalyticsClick={handleAnalyticsNavigate}
        onLogoutClick={handleLogout}
      />
      <Outlet />
    </>
  );
}

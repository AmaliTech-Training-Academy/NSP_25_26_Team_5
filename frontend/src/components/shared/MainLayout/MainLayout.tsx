import { Outlet, useNavigate } from "react-router";
import NavBar from "../NavBar/NavBar";
import { useAuth } from "../../../context/AuthContext/AuthContext";

export default function MainLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <NavBar
        user={user ? { name: user.name, email: user.email } : undefined}
        onLogoutClick={handleLogout}
      />
      <Outlet />
    </>
  );
}

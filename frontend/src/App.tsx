import { Route, Routes } from "react-router";
import PublicRoute from "./app/router/PublicRoute";
import Login from "./features/auth/pages/Login/Login";
import Register from "./features/auth/pages/Register/Register";
import ProtectedRoute from "./app/router/ProtectedRoute";
import MainLayout from "./components/shared/MainLayout/MainLayout";
import Home from "./pages/Home";


const App = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;

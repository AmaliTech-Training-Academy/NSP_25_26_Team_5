import { Route, Routes } from "react-router";
import AdminRoute from "./app/router/AdminRoute";
import PublicRoute from "./app/router/PublicRoute";
import Login from "./features/auth/pages/Login/Login";
import Register from "./features/auth/pages/Register/Register";
import ProtectedRoute from "./app/router/ProtectedRoute";
import MainLayout from "./components/shared/MainLayout/MainLayout";
import AnalyticsDashboard from "./features/analytics/pages/AnalyticsDashboard";
import PostDetail from "./features/post/pages/PostDetail/PostDetail";
import PostNotFound from "./features/post/pages/PostNotFound/PostNotFound";
import UserProfile from "./features/profile/pages/UserProfile";
import Home from "./pages/Home/Home";
import NotFound from "./pages/NotFound/NotFound";

const App = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="posts" element={<PostNotFound />} />
        <Route path="posts/:postId" element={<PostDetail />} />
        <Route path="posts/*" element={<PostNotFound />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="profile" element={<UserProfile />} />
          <Route element={<AdminRoute />}>
            <Route path="analytics" element={<AnalyticsDashboard />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;

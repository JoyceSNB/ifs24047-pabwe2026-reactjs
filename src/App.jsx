import { Route, Routes } from "react-router-dom";
import AuthLayout from "./features/auth/layouts/AuthLayout";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import LostFoundLayout from "./features/lost-founds/layouts/LostFoundLayout";
import HomePage from "./features/lost-founds/pages/HomePage";
import DetailPage from "./features/lost-founds/pages/DetailPage";
import StatsPage from "./features/lost-founds/pages/StatsPage";
import UsersPage from "./features/users/pages/UsersPage";
import ProfilePage from "./features/users/pages/ProfilePage";
import NotFoundPage from "./features/common/pages/NotFoundPage";

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* Protected dashboard routes (route guard ada di LostFoundLayout) */}
      <Route path="/" element={<LostFoundLayout />}>
        <Route index element={<HomePage />} />
        <Route path="lost-founds/:id" element={<DetailPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;

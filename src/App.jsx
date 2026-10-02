import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "./features/auth/layouts/AuthLayout";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import NotFoundPage from "./features/common/pages/NotFoundPage";

// Halaman dashboard dimuat terpisah (code splitting) agar halaman login lebih ringan
const LostFoundLayout = lazy(() => import("./features/lost-founds/layouts/LostFoundLayout"));
const HomePage = lazy(() => import("./features/lost-founds/pages/HomePage"));
const DetailPage = lazy(() => import("./features/lost-founds/pages/DetailPage"));
const StatsPage = lazy(() => import("./features/lost-founds/pages/StatsPage"));
const UsersPage = lazy(() => import("./features/users/pages/UsersPage"));
const ProfilePage = lazy(() => import("./features/users/pages/ProfilePage"));

// Fallback saat halaman (di dalam layout) sedang dimuat
function PageLoader() {
  return (
    <div className="py-24 text-center text-slate-600" role="status">
      <h1 className="sr-only">Memuat halaman</h1>
      Memuat halaman...
    </div>
  );
}

// Fallback saat layout dashboard sedang dimuat (belum ada <main> dari layout)
function LayoutLoader() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-100">
      <h1 className="sr-only">Delcom Lost &amp; Found</h1>
      <p className="text-sm font-medium text-slate-600" role="status">
        Memuat aplikasi...
      </p>
    </main>
  );
}

function withSuspense(element, fallback = <PageLoader />) {
  return <Suspense fallback={fallback}>{element}</Suspense>;
}

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* Protected dashboard routes (route guard ada di LostFoundLayout) */}
      <Route path="/" element={withSuspense(<LostFoundLayout />, <LayoutLoader />)}>
        <Route index element={withSuspense(<HomePage />)} />
        <Route path="lost-founds/:id" element={withSuspense(<DetailPage />)} />
        <Route path="stats" element={withSuspense(<StatsPage />)} />
        <Route path="users" element={withSuspense(<UsersPage />)} />
        <Route path="profile" element={withSuspense(<ProfilePage />)} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
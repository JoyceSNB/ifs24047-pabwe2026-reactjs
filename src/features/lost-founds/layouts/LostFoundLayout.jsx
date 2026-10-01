import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import apiHelper from "../../../helpers/apiHelper";
import { asyncSetProfile, setIsProfile } from "../../users/states/action";
import { asyncSetIsAuthLogout, setIsAuthLogoutActionCreator } from "../../auth/states/action";
import NavbarComponent from "../components/NavbarComponent";
import SidebarComponent from "../components/SidebarComponent";

function LostFoundLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector((state) => state.profile);
  const isProfile = useSelector((state) => state.isProfile);
  const isAuthLogout = useSelector((state) => state.isAuthLogout);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Route guard 1: tanpa token langsung ke halaman login, dengan token muat profil
  useEffect(() => {
    const authToken = apiHelper.getAccessToken();
    if (authToken) {
      dispatch(asyncSetProfile());
    } else {
      navigate("/auth/login");
    }
  }, [dispatch, navigate]);

  // Route guard 2: token tidak valid (profil gagal dimuat) -> hapus token, ke login
  useEffect(() => {
    if (isProfile) {
      dispatch(setIsProfile(false));
      if (!profile) {
        apiHelper.putAccessToken("");
        navigate("/auth/login");
      }
    }
  }, [isProfile, profile, dispatch, navigate]);

  // Setelah logout kembali ke halaman login
  useEffect(() => {
    if (isAuthLogout) {
      dispatch(setIsAuthLogoutActionCreator(false));
      navigate("/auth/login");
    }
  }, [isAuthLogout, dispatch, navigate]);

  function handleLogout() {
    dispatch(asyncSetIsAuthLogout());
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="flex flex-col items-center gap-3" role="status">
          <div className="w-10 h-10 border-4 border-teal-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Memeriksa sesi masuk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-slate-800">
      <NavbarComponent
        profile={profile}
        handleLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <SidebarComponent
        isSidebarOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      <main className="pt-16 md:pl-64">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default LostFoundLayout;

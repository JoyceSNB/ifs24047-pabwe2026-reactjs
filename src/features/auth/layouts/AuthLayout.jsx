import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import apiHelper from "../../../helpers/apiHelper";
import { asyncSetProfile, setIsProfile } from "../../users/states/action";
import { IconTag } from "@tabler/icons-react";

function AuthLayout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector((state) => state.profile);
  const isProfile = useSelector((state) => state.isProfile);

  // Jika token tersimpan, coba muat profil untuk mengecek sesi
  useEffect(() => {
    const authToken = apiHelper.getAccessToken();
    if (authToken) {
      dispatch(asyncSetProfile());
    }
  }, [dispatch]);

  // Pengguna yang sudah login dialihkan ke dashboard
  useEffect(() => {
    if (isProfile) {
      dispatch(setIsProfile(false));
      if (profile) {
        navigate("/");
      }
    }
  }, [isProfile, profile, dispatch, navigate]);

  const isLoginActive = location.pathname === "/auth/login";

  return (
    <div className="min-h-screen bg-stone-100 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Visual banner (desktop) */}
      <aside
        data-testid="auth-banner"
        className="hidden lg:flex relative overflow-hidden bg-teal-900 text-teal-50 flex-col justify-between p-12"
      >
        <div className="relative z-10 max-w-sm">
          <p className="text-teal-200 text-sm font-semibold">Kampus IT Del</p>
          <h2 className="mt-4 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white">
            Barang hilang, kembali ke pemiliknya.
          </h2>
          <p className="mt-5 text-teal-100/90 leading-relaxed">
            Catat barang yang kamu hilangkan atau temukan, unggah fotonya, dan
            tandai selesai saat barang sudah kembali.
          </p>
        </div>

        {/* Ilustrasi label barang */}
        <div aria-hidden="true" className="relative h-64">
          <div className="absolute left-6 bottom-6 w-56 rotate-[-8deg] rounded-2xl bg-amber-300 text-teal-950 p-5 shadow-2xl shadow-black/30">
            <span className="absolute top-4 right-4 w-4 h-4 rounded-full bg-teal-900 ring-4 ring-amber-200" />
            <p className="font-display text-2xl font-extrabold">Ditemukan</p>
            <p className="mt-1 text-sm font-medium">Botol minum biru, Gedung 9</p>
            <div className="mt-5 h-1.5 w-24 rounded-full bg-teal-950/25" />
          </div>
          <div className="absolute left-60 bottom-28 w-52 rotate-[7deg] rounded-2xl bg-white text-slate-800 p-5 shadow-2xl shadow-black/30">
            <span className="absolute top-4 right-4 w-4 h-4 rounded-full bg-teal-900 ring-4 ring-slate-200" />
            <p className="font-display text-2xl font-extrabold text-rose-600">Hilang</p>
            <p className="mt-1 text-sm font-medium text-slate-600">Kunci motor, kantin</p>
            <div className="mt-5 h-1.5 w-20 rounded-full bg-slate-200" />
          </div>
        </div>
      </aside>

      {/* Kontainer form */}
      <main className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-800 text-amber-300 flex items-center justify-center">
              <IconTag size={24} stroke={2.25} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-slate-800 tracking-tight">
                Delcom Lost &amp; Found
              </h1>
              <p className="text-sm text-slate-600">Laporan barang hilang dan temuan</p>
            </div>
          </div>

          <div className="mt-8 bg-white py-8 px-6 sm:px-8 rounded-3xl border border-slate-200/80 shadow-sm">
            {/* Tabs */}
            <div className="flex rounded-2xl bg-slate-100 p-1 mb-6">
              <NavLink
                to="/auth/login"
                className={`flex-1 py-2 text-center text-sm font-semibold rounded-xl transition-all ${
                  isLoginActive
                    ? "bg-white text-teal-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Masuk Akun
              </NavLink>
              <NavLink
                to="/auth/register"
                className={`flex-1 py-2 text-center text-sm font-semibold rounded-xl transition-all ${
                  !isLoginActive
                    ? "bg-white text-teal-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Daftar Baru
              </NavLink>
            </div>

            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;

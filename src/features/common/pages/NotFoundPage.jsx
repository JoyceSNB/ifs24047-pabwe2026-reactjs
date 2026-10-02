import { useNavigate } from "react-router-dom";
import { IconAlertTriangle, IconArrowLeft, IconHome } from "@tabler/icons-react";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-stone-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full text-center">
        {/* Decorative Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-teal-50 text-teal-700 mb-6 shadow-sm ring-8 ring-teal-50/50">
          <IconAlertTriangle size={40} stroke={2} />
        </div>

        {/* Status Code & Headings */}
        <h1 className="text-7xl sm:text-8xl font-black text-slate-900 tracking-tight">
          404
        </h1>
        <h2 className="mt-3 text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          Halaman Tidak Ditemukan
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
          Alamat ini tidak ada atau sudah dipindahkan. Periksa kembali tautannya, atau kembali ke daftar laporan.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            data-testid="back-btn"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 shadow-xs transition-all cursor-pointer"
          >
            <IconArrowLeft size={18} />
            <span>Kembali</span>
          </button>
          <button
            type="button"
            data-testid="home-btn"
            onClick={() => navigate("/")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-teal-700 hover:bg-teal-800 active:bg-teal-900 shadow-md shadow-teal-700/25 transition-all cursor-pointer"
          >
            <IconHome size={18} />
            <span>Ke Halaman Utama</span>
          </button>
        </div>
      </div>
    </main>
  );
}

export default NotFoundPage;
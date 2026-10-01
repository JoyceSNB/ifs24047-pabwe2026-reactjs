import { NavLink } from "react-router-dom";
import {
  IconClipboardList,
  IconChartBar,
  IconUsers,
  IconUserCircle,
} from "@tabler/icons-react";

export const NAV_ITEMS = [
  { to: "/", label: "Laporan", icon: IconClipboardList, end: true },
  { to: "/stats", label: "Statistik", icon: IconChartBar, end: false },
  { to: "/users", label: "Pengguna", icon: IconUsers, end: false },
  { to: "/profile", label: "Profil Saya", icon: IconUserCircle, end: false },
];

function SidebarComponent({ isSidebarOpen, onCloseMobile }) {
  return (
    <>
      {/* Latar gelap untuk drawer mobile */}
      {isSidebarOpen && (
        <button
          type="button"
          data-testid="sidebar-backdrop"
          aria-label="Tutup menu"
          tabIndex={-1}
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-slate-800/40 md:hidden cursor-default"
        />
      )}

      <aside
        data-testid="sidebar"
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200 p-4 transition-transform duration-200 ease-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <nav aria-label="Menu utama" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-teal-800 text-white"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                    }`
                  }
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="rounded-2xl bg-amber-100 px-4 py-3 text-amber-800">
            <p className="text-sm font-semibold">Menemukan barang?</p>
            <p className="text-xs mt-0.5 leading-relaxed">
              Buat laporan &ldquo;Ditemukan&rdquo; agar pemiliknya bisa menghubungimu.
            </p>
            <p className="text-[11px] mt-2 text-amber-800">Praktikum 4 PABWE</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default SidebarComponent;

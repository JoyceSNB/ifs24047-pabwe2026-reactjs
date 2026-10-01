import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconLoader2, IconRefresh } from "@tabler/icons-react";
import { asyncSetLostFoundStats } from "../states/action";

const PERIODS = [
  { value: "daily", label: "7 hari terakhir" },
  { value: "monthly", label: "6 bulan terakhir" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// "06-10-2024" -> "6 Okt", "10-2024" -> "Okt 2024"
export function formatStatsLabel(label) {
  const parts = label.split("-").map(Number);
  if (parts.length === 3) {
    return `${parts[0]} ${MONTHS[parts[1] - 1]}`;
  }
  return `${MONTHS[parts[0] - 1]} ${parts[1]}`;
}

// Ubah respons API menjadi baris per periode
export function buildStatsRows(data = {}) {
  const losts = data.stats_losts || {};
  const founds = data.stats_founds || {};
  const lostsDone = data.stats_losts_completed || {};
  const foundsDone = data.stats_founds_completed || {};
  const labels = Array.from(new Set([...Object.keys(losts), ...Object.keys(founds)]));

  return labels.map((label) => ({
    label,
    lost: losts[label] || 0,
    found: founds[label] || 0,
    completed: (lostsDone[label] || 0) + (foundsDone[label] || 0),
  }));
}

function StatsPage() {
  const dispatch = useDispatch();
  const mountedRef = useRef(true);
  const stats = useSelector((state) => state.lostFoundStats);

  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadStats = useCallback(() => {
    setLoading(true);
    return Promise.resolve(dispatch(asyncSetLostFoundStats(period))).finally(() => {
      if (mountedRef.current) setLoading(false);
    });
  }, [dispatch, period]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const rows = stats && stats.period === period ? buildStatsRows(stats.data) : [];
  const totals = rows.reduce(
    (acc, row) => ({
      lost: acc.lost + row.lost,
      found: acc.found + row.found,
      completed: acc.completed + row.completed,
    }),
    { lost: 0, found: 0, completed: 0 }
  );
  const maxValue = Math.max(1, ...rows.map((row) => Math.max(row.lost, row.found)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800">
            Statistik laporan
          </h1>
          <p className="mt-1 text-slate-600">Jumlah laporan hilang dan temuan per periode.</p>
        </div>
        <div className="inline-flex rounded-xl bg-slate-200/70 p-1 self-start" role="group" aria-label="Periode">
          {PERIODS.map((option) => (
            <button
              key={option.value}
              type="button"
              data-testid={`period-${option.value}-btn`}
              aria-pressed={period === option.value}
              onClick={() => setPeriod(option.value)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                period === option.value ? "bg-white text-slate-800 shadow-xs" : "text-slate-600 hover:text-slate-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div data-testid="stats-loading" className="py-24 text-center text-slate-600" role="status">
          <IconLoader2 size={32} className="mx-auto mb-2 animate-spin text-teal-700" />
          Memuat statistik...
        </div>
      ) : !stats ? (
        <div
          data-testid="stats-error"
          className="py-16 px-6 text-center rounded-2xl border-2 border-dashed border-slate-300"
        >
          <p className="font-semibold text-slate-800">Statistik gagal dimuat.</p>
          <p className="text-sm text-slate-600">Periksa koneksi internet lalu muat ulang.</p>
          <button
            type="button"
            data-testid="stats-retry-btn"
            onClick={loadStats}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-teal-800 hover:bg-teal-50"
          >
            <IconRefresh size={17} />
            Muat ulang
          </button>
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-3 gap-px rounded-2xl bg-slate-200 border border-slate-200 overflow-hidden">
            <div className="bg-white px-5 py-4">
              <dt className="text-sm text-slate-600">Hilang</dt>
              <dd data-testid="total-lost" className="font-display text-3xl font-extrabold tabular-nums text-rose-600">
                {totals.lost}
              </dd>
            </div>
            <div className="bg-white px-5 py-4">
              <dt className="text-sm text-slate-600">Ditemukan</dt>
              <dd data-testid="total-found" className="font-display text-3xl font-extrabold tabular-nums text-amber-700">
                {totals.found}
              </dd>
            </div>
            <div className="bg-white px-5 py-4">
              <dt className="text-sm text-slate-600">Selesai</dt>
              <dd data-testid="total-completed" className="font-display text-3xl font-extrabold tabular-nums text-teal-800">
                {totals.completed}
              </dd>
            </div>
          </dl>

          {/* Grafik batang sederhana */}
          <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-rose-500" /> Hilang
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-amber-300" /> Ditemukan
              </span>
            </div>

            {rows.length === 0 ? (
              <p data-testid="stats-empty" className="py-12 text-center text-slate-600">
                Belum ada data pada periode ini.
              </p>
            ) : (
              <div
                data-testid="stats-chart"
                className="mt-6 grid gap-3 items-end h-56"
                style={{ gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))` }}
              >
                {rows.map((row) => (
                  <div key={row.label} className="flex flex-col items-center gap-2 h-full">
                    <div className="flex-1 w-full flex items-end justify-center gap-1">
                      <div
                        title={`Hilang: ${row.lost}`}
                        className="w-1/3 max-w-6 rounded-t-md bg-rose-500"
                        style={{ height: `${(row.lost / maxValue) * 100}%` }}
                      />
                      <div
                        title={`Ditemukan: ${row.found}`}
                        className="w-1/3 max-w-6 rounded-t-md bg-amber-300"
                        style={{ height: `${(row.found / maxValue) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600 whitespace-nowrap">
                      {formatStatsLabel(row.label)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Rincian dalam tabel */}
          {rows.length > 0 && (
            <div className="rounded-2xl bg-white border border-slate-200 overflow-x-auto">
              <table data-testid="stats-table" className="w-full text-sm">
                <thead className="text-left text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Periode</th>
                    <th className="px-5 py-3 font-semibold text-right">Hilang</th>
                    <th className="px-5 py-3 font-semibold text-right">Ditemukan</th>
                    <th className="px-5 py-3 font-semibold text-right">Selesai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {rows.map((row) => (
                    <tr key={row.label}>
                      <td className="px-5 py-3 text-slate-800">{formatStatsLabel(row.label)}</td>
                      <td className="px-5 py-3 text-right">{row.lost}</td>
                      <td className="px-5 py-3 text-right">{row.found}</td>
                      <td className="px-5 py-3 text-right">{row.completed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StatsPage;

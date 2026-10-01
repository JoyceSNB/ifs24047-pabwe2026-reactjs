import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IconPlus, IconSearch, IconLoader2, IconTagOff } from "@tabler/icons-react";
import AddModal from "../modals/AddModal";
import ChangeModal from "../modals/ChangeModal";
import LostFoundCard from "../components/LostFoundCard";
import {
  asyncSetLostFounds,
  asyncSetIsLostFoundDelete,
  setIsLostFoundDeleteActionCreator,
  setIsLostFoundDeletedActionCreator,
} from "../states/action";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

const SCOPE_OPTIONS = [
  { value: "all", label: "Semua laporan" },
  { value: "me", label: "Laporan saya" },
];

const TYPE_OPTIONS = [
  { value: "", label: "Semua jenis" },
  { value: "lost", label: "Hilang" },
  { value: "found", label: "Ditemukan" },
];

const COMPLETION_OPTIONS = [
  { value: "", label: "Semua status" },
  { value: "0", label: "Belum selesai" },
  { value: "1", label: "Selesai" },
];

// Filter jenis, status selesai, dan kata kunci dilakukan di sisi klien
export function filterLostFounds(list, { type, completion, query }) {
  const q = query.trim().toLowerCase();
  return list.filter((item) => {
    if (type && item.status !== type) return false;
    if (completion !== "" && String(Number(Boolean(item.is_completed))) !== completion) {
      return false;
    }
    if (!q) return true;
    const haystack = [item.title, item.description, item.author?.name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

function SegmentButton({ active, onClick, children, testId }) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={active}
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
        active ? "bg-white text-slate-800 shadow-xs" : "text-slate-600 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  const profile = useSelector((state) => state.profile);
  const lostFounds = useSelector((state) => state.lostFounds);
  const isLostFoundDeleted = useSelector((state) => state.isLostFoundDeleted);

  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState("all");
  const [typeFilter, setTypeFilter] = useState("");
  const [completionFilter, setCompletionFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLostFound, setEditingLostFound] = useState(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadLostFounds = useCallback(() => {
    setLoading(true);
    const filters = scope === "me" ? { is_me: 1 } : {};
    return Promise.resolve(dispatch(asyncSetLostFounds(filters))).finally(() => {
      if (mountedRef.current) setLoading(false);
    });
  }, [dispatch, scope]);

  useEffect(() => {
    loadLostFounds();
  }, [loadLostFounds]);

  // Muat ulang daftar setelah laporan dihapus
  useEffect(() => {
    if (isLostFoundDeleted) {
      dispatch(setIsLostFoundDeletedActionCreator(false));
      dispatch(setIsLostFoundDeleteActionCreator(false));
      loadLostFounds();
    }
  }, [isLostFoundDeleted, dispatch, loadLostFounds]);

  const closeAddModal = useCallback(() => setShowAddModal(false), []);
  const closeChangeModal = useCallback(() => setEditingLostFound(null), []);

  if (!profile) return null;

  async function handleDelete(lostFoundId) {
    const result = await showConfirmDialog("Hapus laporan ini? Tindakan ini tidak bisa dibatalkan.");
    if (result.isConfirmed) {
      dispatch(asyncSetIsLostFoundDelete(lostFoundId));
    }
  }

  function resetFilters() {
    setTypeFilter("");
    setCompletionFilter("");
    setSearchQuery("");
  }

  const list = lostFounds || [];
  const metrics = [
    { label: "Total laporan", value: list.length, tone: "text-slate-800" },
    {
      label: "Barang hilang",
      value: list.filter((item) => item.status === "lost").length,
      tone: "text-rose-600",
    },
    {
      label: "Barang ditemukan",
      value: list.filter((item) => item.status === "found").length,
      tone: "text-amber-700",
    },
    {
      label: "Selesai",
      value: list.filter((item) => Boolean(item.is_completed)).length,
      tone: "text-teal-800",
    },
  ];

  const filtered = filterLostFounds(list, {
    type: typeFilter,
    completion: completionFilter,
    query: searchQuery,
  });
  const isFiltering = Boolean(typeFilter || completionFilter || searchQuery.trim());

  return (
    <div className="space-y-6">
      {/* Judul halaman */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800">
            Laporan barang
          </h1>
          <p className="mt-1 text-slate-600">
            Barang hilang dan temuan yang dilaporkan di kampus.
          </p>
        </div>
        <button
          type="button"
          data-testid="add-lost-found-btn"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-teal-800 hover:bg-teal-900 transition-colors self-start sm:self-auto"
        >
          <IconPlus size={18} stroke={2.5} />
          Buat laporan
        </button>
      </div>

      {/* Lingkup data: semua / milik saya */}
      <div className="inline-flex rounded-xl bg-slate-200/70 p-1" role="group" aria-label="Lingkup laporan">
        {SCOPE_OPTIONS.map((option) => (
          <SegmentButton
            key={option.value}
            testId={`scope-${option.value}-btn`}
            active={scope === option.value}
            onClick={() => setScope(option.value)}
          >
            {option.label}
          </SegmentButton>
        ))}
      </div>

      {/* Ringkasan metrik */}
      <dl
        data-testid="metrics"
        className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl bg-slate-200 border border-slate-200 overflow-hidden"
      >
        {metrics.map((metric, index) => (
          <div key={metric.label} className="bg-white px-5 py-4">
            <dt className="text-sm text-slate-600">{metric.label}</dt>
            <dd
              data-testid={`metric-${index}`}
              className={`font-display text-3xl font-extrabold tabular-nums ${metric.tone}`}
            >
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Filter & pencarian */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <IconSearch
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            data-testid="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama barang, deskripsi, atau pelapor"
            aria-label="Cari laporan"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/25 focus:border-teal-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl bg-slate-200/70 p-1" role="group" aria-label="Jenis laporan">
            {TYPE_OPTIONS.map((option) => (
              <SegmentButton
                key={option.value || "all"}
                testId={`type-${option.value || "all"}-btn`}
                active={typeFilter === option.value}
                onClick={() => setTypeFilter(option.value)}
              >
                {option.label}
              </SegmentButton>
            ))}
          </div>

          <select
            data-testid="completion-select"
            aria-label="Status penyelesaian"
            value={completionFilter}
            onChange={(e) => setCompletionFilter(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/25 focus:border-teal-700"
          >
            {COMPLETION_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Daftar laporan */}
      {loading && list.length === 0 ? (
        <div data-testid="list-loading" className="py-20 text-center text-slate-600" role="status">
          <IconLoader2 size={32} className="mx-auto mb-2 animate-spin text-teal-700" />
          Memuat laporan...
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-testid="list-empty"
          className="py-16 px-6 text-center rounded-2xl border-2 border-dashed border-slate-300"
        >
          <IconTagOff size={36} className="mx-auto text-slate-400" />
          {isFiltering ? (
            <>
              <p className="mt-3 font-semibold text-slate-800">Tidak ada laporan yang cocok.</p>
              <p className="text-sm text-slate-600">Ubah kata kunci atau filter yang dipakai.</p>
              <button
                type="button"
                data-testid="reset-filter-btn"
                onClick={resetFilters}
                className="mt-4 px-4 py-2 text-sm font-semibold rounded-xl text-teal-800 hover:bg-teal-50"
              >
                Hapus filter
              </button>
            </>
          ) : (
            <>
              <p className="mt-3 font-semibold text-slate-800">Belum ada laporan.</p>
              <p className="text-sm text-slate-600">
                Buat laporan untuk barang yang hilang atau yang kamu temukan.
              </p>
              <button
                type="button"
                data-testid="empty-add-btn"
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-teal-800 hover:bg-teal-900"
              >
                Buat laporan
              </button>
            </>
          )}
        </div>
      ) : (
        <div data-testid="lost-found-grid" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <LostFoundCard
              key={item.id}
              lostFound={item}
              isOwner={item.user_id === profile.id}
              onView={(id) => navigate(`/lost-founds/${id}`)}
              onEdit={setEditingLostFound}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <AddModal show={showAddModal} onClose={closeAddModal} onSuccess={loadLostFounds} />
      <ChangeModal
        show={Boolean(editingLostFound)}
        lostFound={editingLostFound}
        onClose={closeChangeModal}
        onSuccess={loadLostFounds}
      />
    </div>
  );
}

export default HomePage;

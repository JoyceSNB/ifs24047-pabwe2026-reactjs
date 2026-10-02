import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  IconArrowLeft,
  IconPhotoUp,
  IconEdit,
  IconTrash,
  IconPhotoOff,
  IconLoader2,
} from "@tabler/icons-react";
import {
  asyncSetLostFound,
  asyncSetIsLostFoundDelete,
  setIsLostFoundActionCreator,
  setIsLostFoundDeleteActionCreator,
  setIsLostFoundDeletedActionCreator,
} from "../states/action";
import { formatDate, showConfirmDialog, toImageUrl } from "../../../helpers/toolsHelper";
import { StatusBadge, CompletionBadge } from "../components/StatusBadge";
import ChangeCoverModal from "../modals/ChangeCoverModal";
import ChangeModal from "../modals/ChangeModal";

function DetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector((state) => state.profile);
  const lostFound = useSelector((state) => state.lostFound);
  const isLostFound = useSelector((state) => state.isLostFound);
  const isLostFoundDeleted = useSelector((state) => state.isLostFoundDeleted);

  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadDetail = useCallback(() => {
    dispatch(asyncSetLostFound(id));
  }, [dispatch, id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // Laporan tidak ditemukan -> kembali ke daftar
  useEffect(() => {
    if (isLostFound) {
      dispatch(setIsLostFoundActionCreator(false));
      if (!lostFound) {
        navigate("/");
      }
    }
  }, [isLostFound, lostFound, dispatch, navigate]);

  // Setelah dihapus -> kembali ke daftar
  useEffect(() => {
    if (isLostFoundDeleted) {
      dispatch(setIsLostFoundDeletedActionCreator(false));
      dispatch(setIsLostFoundDeleteActionCreator(false));
      navigate("/");
    }
  }, [isLostFoundDeleted, dispatch, navigate]);

  const closeCoverModal = useCallback(() => setShowCoverModal(false), []);
  const closeEditModal = useCallback(() => setShowEditModal(false), []);

  // Tampilkan loading juga ketika data di store masih milik laporan lain
  if (!profile || !lostFound || String(lostFound.id) !== String(id)) {
    return (
      <div data-testid="detail-loading" className="py-24 text-center text-slate-600" role="status">
        <h1 className="sr-only">Detail laporan</h1>
        <IconLoader2 size={32} className="mx-auto mb-2 animate-spin text-teal-700" />
        Memuat laporan...
      </div>
    );
  }

  async function handleDelete() {
    const result = await showConfirmDialog("Hapus laporan ini? Tindakan ini tidak bisa dibatalkan.");
    if (result.isConfirmed) {
      dispatch(asyncSetIsLostFoundDelete(lostFound.id));
    }
  }

  const isOwner = lostFound.user_id === profile.id;
  const isLost = lostFound.status === "lost";
  const coverUrl = toImageUrl(lostFound.cover);
  const authorPhoto = toImageUrl(lostFound.author?.photo);
  const authorName = lostFound.author?.name || "Pengguna";

  return (
    <div className="space-y-6">
      <Link
        to="/"
        data-testid="back-link"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-800"
      >
        <IconArrowLeft size={18} />
        Kembali ke daftar laporan
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
        {/* Foto barang, rasio mengikuti foto asli */}
        <figure className="rounded-3xl overflow-hidden bg-slate-800">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={lostFound.title}
              data-testid="detail-cover"
              className="w-full h-auto max-h-[70vh] object-contain mx-auto"
            />
          ) : (
            <div
              data-testid="detail-no-cover"
              className="aspect-[4/3] flex flex-col items-center justify-center gap-2 bg-slate-100 text-slate-600"
            >
              <IconPhotoOff size={40} />
              <span className="text-sm">Belum ada foto barang</span>
            </div>
          )}
        </figure>

        {/* Informasi laporan */}
        <section className="relative rounded-3xl bg-white border border-slate-200 overflow-hidden">
          <div className={`h-2 ${isLost ? "bg-rose-500" : "bg-amber-300"}`} />
          <div className="p-6 sm:p-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={lostFound.status} size="lg" />
              <CompletionBadge isCompleted={Boolean(lostFound.is_completed)} />
              <span className="ml-auto text-sm text-slate-500 tabular-nums">No. {lostFound.id}</span>
            </div>

            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-800">
              {lostFound.title}
            </h1>

            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {lostFound.description || "Pelapor belum menambahkan deskripsi."}
            </p>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              {authorPhoto ? (
                <img
                  src={authorPhoto}
                  alt={authorName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="w-10 h-10 rounded-full bg-teal-100 text-teal-900 flex items-center justify-center font-bold">
                  {authorName.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-xs text-slate-600">Dilaporkan oleh</p>
                <p className="font-semibold text-slate-800 truncate">
                  {authorName}
                  {isOwner && <span className="font-normal text-slate-600"> (kamu)</span>}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-600">Tanggal lapor</dt>
                <dd className="font-medium text-slate-800">{formatDate(lostFound.created_at)}</dd>
              </div>
              <div>
                <dt className="text-slate-600">Terakhir diperbarui</dt>
                <dd className="font-medium text-slate-800">{formatDate(lostFound.updated_at)}</dd>
              </div>
            </dl>

            {isOwner ? (
              <div className="flex flex-wrap gap-2 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  data-testid="edit-cover-btn"
                  onClick={() => setShowCoverModal(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors"
                >
                  <IconPhotoUp size={17} />
                  Ganti foto
                </button>
                <button
                  type="button"
                  data-testid="edit-detail-btn"
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <IconEdit size={17} />
                  Ubah laporan
                </button>
                <button
                  type="button"
                  data-testid="delete-detail-btn"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <IconTrash size={17} />
                  Hapus
                </button>
              </div>
            ) : (
              <p data-testid="not-owner-note" className="pt-5 border-t border-slate-100 text-sm text-slate-600">
                Hanya pelapor yang dapat mengubah atau menghapus laporan ini.
              </p>
            )}
          </div>
        </section>
      </div>

      <ChangeCoverModal
        show={showCoverModal}
        onClose={closeCoverModal}
        lostFound={lostFound}
        onSuccess={loadDetail}
      />
      <ChangeModal
        show={showEditModal}
        onClose={closeEditModal}
        lostFound={lostFound}
        onSuccess={loadDetail}
      />
    </div>
  );
}

export default DetailPage;
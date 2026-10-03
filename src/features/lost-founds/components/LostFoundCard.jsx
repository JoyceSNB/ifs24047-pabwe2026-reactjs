import { IconEye, IconPencil, IconTrash, IconPhotoOff } from "@tabler/icons-react";
import { formatShortDate, toImageUrl } from "../../../helpers/toolsHelper";
import { StatusBadge, CompletionBadge } from "./StatusBadge";

// Kartu laporan berbentuk label barang (tag) dengan lubang tali di pojok
// priority: true untuk kartu pertama agar fotonya langsung diunduh (bukan lazy)
function LostFoundCard({ lostFound, isOwner, onView, onEdit, onDelete, priority = false }) {
  const isLost = lostFound.status === "lost";
  const authorName = lostFound.author?.name || "Pengguna";

  return (
    <article
      data-testid={`lost-found-card-${lostFound.id}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-shadow"
    >
      <div className={`h-1.5 ${isLost ? "bg-rose-500" : "bg-amber-300"}`} />

      <button
        type="button"
        data-testid={`view-lost-found-${lostFound.id}`}
        onClick={() => onView(lostFound.id)}
        className="relative block aspect-[4/3] bg-slate-100 text-left"
        aria-label={`Lihat detail ${lostFound.title}`}
      >
        {lostFound.cover ? (
          <img
            src={toImageUrl(lostFound.cover)}
            alt={lostFound.title}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            width={400}
            height={300}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-600">
            <IconPhotoOff size={28} />
            <span className="text-xs">Belum ada foto</span>
          </span>
        )}
        {/* lubang tali label */}
        <span
          aria-hidden="true"
          className="absolute top-3 left-3 w-4 h-4 rounded-full bg-stone-100 ring-2 ring-slate-300/80 shadow-inner"
        />
      </button>

      <div className="flex-1 flex flex-col p-4 gap-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={lostFound.status} />
          {Boolean(lostFound.is_completed) && <CompletionBadge isCompleted />}
          <span className="ml-auto text-xs text-slate-500 tabular-nums">No. {lostFound.id}</span>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold leading-snug text-slate-800 line-clamp-2">
            {lostFound.title}
          </h2>
          {lostFound.description && (
            <p className="mt-1 text-sm text-slate-500 line-clamp-2">{lostFound.description}</p>
          )}
        </div>

        <p className="mt-auto text-xs text-slate-500 truncate">
          Dilaporkan {authorName}, {formatShortDate(lostFound.created_at)}
        </p>

        <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            data-testid={`open-lost-found-${lostFound.id}`}
            onClick={() => onView(lostFound.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl text-teal-800 hover:bg-teal-50 transition-colors"
          >
            <IconEye size={17} />
            Lihat detail
          </button>
          {isOwner && (
            <>
              <button
                type="button"
                data-testid={`edit-lost-found-${lostFound.id}`}
                onClick={() => onEdit(lostFound)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                aria-label={`Ubah ${lostFound.title}`}
                title="Ubah laporan"
              >
                <IconPencil size={18} />
              </button>
              <button
                type="button"
                data-testid={`delete-lost-found-${lostFound.id}`}
                onClick={() => onDelete(lostFound.id)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                aria-label={`Hapus ${lostFound.title}`}
                title="Hapus laporan"
              >
                <IconTrash size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default LostFoundCard;
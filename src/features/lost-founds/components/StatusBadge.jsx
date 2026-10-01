import { IconCircleCheck, IconClock } from "@tabler/icons-react";

export const STATUS_LABEL = {
  lost: "Hilang",
  found: "Ditemukan",
};

// Label jenis laporan: hilang / ditemukan
export function StatusBadge({ status, size = "sm" }) {
  const isLost = status === "lost";
  const sizeClass = size === "lg" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs";
  return (
    <span
      data-testid="status-badge"
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClass} ${
        isLost ? "bg-rose-50 text-rose-700" : "bg-amber-100 text-amber-800"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isLost ? "bg-rose-500" : "bg-amber-500"}`} />
      {isLost ? STATUS_LABEL.lost : STATUS_LABEL.found}
    </span>
  );
}

// Label status penyelesaian laporan
export function CompletionBadge({ isCompleted }) {
  return isCompleted ? (
    <span
      data-testid="completion-badge"
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-teal-50 text-teal-800"
    >
      <IconCircleCheck size={14} />
      Selesai
    </span>
  ) : (
    <span
      data-testid="completion-badge"
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600"
    >
      <IconClock size={14} />
      Belum selesai
    </span>
  );
}

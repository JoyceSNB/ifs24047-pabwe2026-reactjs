import { useEffect } from "react";
import { IconX } from "@tabler/icons-react";

// Kerangka modal bersama: overlay, judul, tombol tutup, kunci scroll body, tombol Esc
function ModalShell({ testId, title, icon, onClose, closeTestId, children }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    function handleKey(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      data-testid={testId}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-800/50"
    >
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {icon}
            <h2 className="font-display text-lg font-bold text-slate-800">{title}</h2>
          </div>
          <button
            type="button"
            data-testid={closeTestId}
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default ModalShell;

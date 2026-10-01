import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconEdit, IconLoader2 } from "@tabler/icons-react";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import {
  asyncSetIsLostFoundChange,
  setIsLostFoundChangeActionCreator,
  setIsLostFoundChangedActionCreator,
} from "../states/action";
import ModalShell from "./ModalShell";
import StatusPicker from "./StatusPicker";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/25 focus:border-teal-700 text-sm";

function ChangeModal({ show, onClose, lostFound, onSuccess }) {
  const dispatch = useDispatch();

  const isLostFoundChange = useSelector((state) => state.isLostFoundChange);
  const isLostFoundChanged = useSelector((state) => state.isLostFoundChanged);

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("lost");
  const [isCompleted, setIsCompleted] = useState(false);

  // Isi form dari data laporan setiap kali modal dibuka
  useEffect(() => {
    if (show && lostFound) {
      setTitle(lostFound.title || "");
      setDescription(lostFound.description || "");
      setStatus(lostFound.status === "found" ? "found" : "lost");
      setIsCompleted(Boolean(lostFound.is_completed));
    }
  }, [show, lostFound]);

  useEffect(() => {
    if (isLostFoundChange) {
      setLoading(false);
      dispatch(setIsLostFoundChangeActionCreator(false));
      if (isLostFoundChanged) {
        dispatch(setIsLostFoundChangedActionCreator(false));
        if (onSuccess) onSuccess();
        onClose();
      }
    }
  }, [isLostFoundChange, isLostFoundChanged, dispatch, onClose, onSuccess]);

  function handleSave(event) {
    event.preventDefault();
    if (!title.trim()) {
      showErrorDialog("Nama barang wajib diisi.");
      return;
    }
    if (!description.trim()) {
      showErrorDialog("Deskripsi wajib diisi.");
      return;
    }

    setLoading(true);
    dispatch(
      asyncSetIsLostFoundChange(
        lostFound.id,
        title.trim(),
        description.trim(),
        status,
        isCompleted ? 1 : 0
      )
    );
  }

  if (!show || !lostFound) return null;

  return (
    <ModalShell
      testId="edit-lost-found-modal"
      closeTestId="close-edit-modal-btn"
      title="Ubah laporan"
      onClose={onClose}
      icon={
        <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
          <IconEdit size={18} stroke={2.5} />
        </span>
      }
    >
      <form onSubmit={handleSave} className="p-6 space-y-5" noValidate>
        <StatusPicker
          name="edit-status"
          value={status}
          onChange={setStatus}
          testIdPrefix="edit-status"
        />

        <div>
          <label htmlFor="edit-title" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Nama barang
          </label>
          <input
            id="edit-title"
            type="text"
            data-testid="edit-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="edit-description"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Deskripsi
          </label>
          <textarea
            id="edit-description"
            data-testid="edit-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Toggle status selesai */}
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Tandai selesai</p>
            <p className="text-xs text-slate-500">
              Aktifkan jika barang sudah kembali ke pemiliknya.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isCompleted}
            aria-label="Tandai selesai"
            data-testid="edit-completed-toggle"
            onClick={() => setIsCompleted((prev) => !prev)}
            className={`relative shrink-0 w-12 h-7 rounded-full transition-colors ${
              isCompleted ? "bg-teal-700" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                isCompleted ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            data-testid="cancel-edit-modal-btn"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-edit-modal-btn"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan perubahan"
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export default ChangeModal;

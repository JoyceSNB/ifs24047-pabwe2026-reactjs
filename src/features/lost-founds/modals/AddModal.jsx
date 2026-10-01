import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconPlus, IconLoader2 } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import {
  asyncSetIsLostFoundAdd,
  setIsLostFoundAddActionCreator,
  setIsLostFoundAddedActionCreator,
} from "../states/action";
import ModalShell from "./ModalShell";
import StatusPicker from "./StatusPicker";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/25 focus:border-teal-700 text-sm";

function AddModal({ show, onClose, onSuccess }) {
  const dispatch = useDispatch();

  const isLostFoundAdd = useSelector((state) => state.isLostFoundAdd);
  const isLostFoundAdded = useSelector((state) => state.isLostFoundAdded);

  const [loading, setLoading] = useState(false);
  const [title, changeTitle, setTitle] = useInput("");
  const [description, changeDescription, setDescription] = useInput("");
  const [status, setStatus] = useState("lost");

  useEffect(() => {
    if (isLostFoundAdd) {
      setLoading(false);
      dispatch(setIsLostFoundAddActionCreator(false));
      if (isLostFoundAdded) {
        dispatch(setIsLostFoundAddedActionCreator(false));
        setTitle("");
        setDescription("");
        setStatus("lost");
        if (onSuccess) onSuccess();
        onClose();
      }
    }
  }, [isLostFoundAdd, isLostFoundAdded, dispatch, onClose, onSuccess, setTitle, setDescription]);

  function handleSave(event) {
    event.preventDefault();
    if (!title.trim()) {
      showErrorDialog("Nama barang wajib diisi.");
      return;
    }
    if (!description.trim()) {
      showErrorDialog("Deskripsi wajib diisi, misalnya ciri barang dan lokasi terakhir.");
      return;
    }

    setLoading(true);
    dispatch(asyncSetIsLostFoundAdd(title.trim(), description.trim(), status));
  }

  if (!show) return null;

  return (
    <ModalShell
      testId="add-lost-found-modal"
      closeTestId="close-add-modal-btn"
      title="Buat laporan"
      onClose={onClose}
      icon={
        <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
          <IconPlus size={18} stroke={2.5} />
        </span>
      }
    >
      <form onSubmit={handleSave} className="p-6 space-y-5" noValidate>
        <StatusPicker
          name="add-status"
          value={status}
          onChange={setStatus}
          testIdPrefix="add-status"
        />

        <div>
          <label htmlFor="add-title" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Nama barang
          </label>
          <input
            id="add-title"
            type="text"
            data-testid="add-title-input"
            value={title}
            onChange={changeTitle}
            placeholder="Contoh: Dompet kulit coklat"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="add-description"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Deskripsi
          </label>
          <textarea
            id="add-description"
            data-testid="add-description-input"
            value={description}
            onChange={changeDescription}
            rows={4}
            placeholder="Ciri-ciri barang, lokasi, dan waktu kejadian"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            data-testid="cancel-add-modal-btn"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-add-modal-btn"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan laporan"
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export default AddModal;

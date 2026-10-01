import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconPhotoUp, IconLoader2, IconUpload } from "@tabler/icons-react";
import { showErrorDialog, toImageUrl } from "../../../helpers/toolsHelper";
import {
  asyncSetIsLostFoundChangeCover,
  setIsLostFoundChangeCoverActionCreator,
  setIsLostFoundChangedCoverActionCreator,
} from "../states/action";
import ModalShell from "./ModalShell";

export const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
export const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

function ChangeCoverModal({ show, onClose, lostFound, onSuccess }) {
  const dispatch = useDispatch();

  const isLostFoundChangeCover = useSelector((state) => state.isLostFoundChangeCover);
  const isLostFoundChangedCover = useSelector((state) => state.isLostFoundChangedCover);

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Reset pilihan file setiap kali modal dibuka
  useEffect(() => {
    if (show) {
      setFile(null);
      setPreviewUrl(null);
    }
  }, [show]);

  // Bersihkan object URL pratinjau lama
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (isLostFoundChangeCover) {
      setLoading(false);
      dispatch(setIsLostFoundChangeCoverActionCreator(false));
      if (isLostFoundChangedCover) {
        dispatch(setIsLostFoundChangedCoverActionCreator(false));
        if (onSuccess) onSuccess();
        onClose();
      }
    }
  }, [isLostFoundChangeCover, isLostFoundChangedCover, dispatch, onClose, onSuccess]);

  function handleFileChange(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!ALLOWED_TYPES.includes(selected.type)) {
      showErrorDialog("Format foto harus JPG atau PNG.");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      showErrorDialog("Ukuran foto maksimal 1 MB. Kompres foto lalu coba lagi.");
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  function handleSave(event) {
    event.preventDefault();
    if (!file) {
      showErrorDialog("Pilih foto terlebih dahulu.");
      return;
    }
    setLoading(true);
    dispatch(asyncSetIsLostFoundChangeCover(lostFound.id, file));
  }

  if (!show || !lostFound) return null;

  const currentCover = toImageUrl(lostFound.cover);
  const shownImage = previewUrl || currentCover;

  return (
    <ModalShell
      testId="change-cover-modal"
      closeTestId="close-cover-modal-btn"
      title="Ganti foto barang"
      onClose={onClose}
      icon={
        <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
          <IconPhotoUp size={18} stroke={2.5} />
        </span>
      }
    >
      <form onSubmit={handleSave} className="p-6 space-y-4">
        <label
          htmlFor="cover-file"
          data-testid="cover-dropzone"
          className="relative flex flex-col items-center justify-center w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-300 hover:border-teal-600 bg-slate-50 overflow-hidden transition-colors"
        >
          {shownImage ? (
            <img
              src={shownImage}
              alt={previewUrl ? "Pratinjau foto baru" : "Foto saat ini"}
              data-testid="cover-preview"
              className="w-full h-full object-contain bg-slate-900"
            />
          ) : (
            <span className="flex flex-col items-center text-center px-4 text-slate-500">
              <IconUpload size={26} className="text-teal-700 mb-2" />
              <span className="text-sm font-semibold text-slate-800">Klik untuk memilih foto</span>
              <span className="text-xs mt-1">JPG atau PNG, maksimal 1 MB</span>
            </span>
          )}
          {previewUrl && (
            <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800">
              Pratinjau, belum diunggah
            </span>
          )}
          <input
            id="cover-file"
            type="file"
            data-testid="cover-file-input"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>
        {file && <p className="text-xs text-slate-500 truncate">File dipilih: {file.name}</p>}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            data-testid="cancel-cover-modal-btn"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-cover-modal-btn"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                Mengunggah...
              </>
            ) : (
              "Unggah foto"
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export default ChangeCoverModal;

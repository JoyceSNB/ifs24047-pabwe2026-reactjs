import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import ChangeCoverModal, { MAX_FILE_SIZE } from "./ChangeCoverModal";
import { renderWithProviders } from "../../../test-utils";
import lostFoundApi from "../api/lostFoundApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

const lostFound = { id: 9, title: "Dompet", cover: "img/lost-founds/cover/9.png" };

function pickFile(file) {
  fireEvent.change(screen.getByTestId("cover-file-input"), {
    target: { files: file ? [file] : [] },
  });
}

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({});
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({});
    globalThis.URL.createObjectURL = vi.fn(() => "blob:preview");
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  it("should render nothing when hidden or without data", () => {
    const { rerender } = renderWithProviders(
      <ChangeCoverModal show={false} onClose={vi.fn()} lostFound={lostFound} />
    );
    expect(screen.queryByTestId("change-cover-modal")).not.toBeInTheDocument();
    rerender(<ChangeCoverModal show onClose={vi.fn()} lostFound={null} />);
    expect(screen.queryByTestId("change-cover-modal")).not.toBeInTheDocument();
  });

  it("should show current cover, then empty state when report has no cover", () => {
    const { rerender } = renderWithProviders(
      <ChangeCoverModal show onClose={vi.fn()} lostFound={lostFound} />
    );
    expect(screen.getByAltText("Foto saat ini")).toHaveAttribute(
      "src",
      "https://open-api.delcom.org/img/lost-founds/cover/9.png"
    );

    rerender(<ChangeCoverModal show onClose={vi.fn()} lostFound={{ ...lostFound, cover: null }} />);
    expect(screen.getByText("Klik untuk memilih foto")).toBeInTheDocument();
  });

  it("should validate submit without file, wrong type, and large file", () => {
    renderWithProviders(<ChangeCoverModal show onClose={vi.fn()} lostFound={lostFound} />);

    fireEvent.click(screen.getByTestId("submit-cover-modal-btn"));
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Pilih foto terlebih dahulu.");

    pickFile(null);
    pickFile(new File(["x"], "doc.pdf", { type: "application/pdf" }));
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Format foto harus JPG atau PNG.");

    const big = new File(["x"], "big.png", { type: "image/png" });
    Object.defineProperty(big, "size", { value: MAX_FILE_SIZE + 1 });
    pickFile(big);
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
      "Ukuran foto maksimal 1 MB. Kompres foto lalu coba lagi."
    );
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("should preview selected file and upload it", async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const spy = vi.spyOn(lostFoundApi, "postLostFoundCover").mockResolvedValue("Berhasil");
    const file = new File(["img"], "foto.png", { type: "image/png" });

    const { unmount } = renderWithProviders(
      <ChangeCoverModal show onClose={onClose} lostFound={lostFound} onSuccess={onSuccess} />
    );

    pickFile(file);
    expect(screen.getByAltText("Pratinjau foto baru")).toHaveAttribute("src", "blob:preview");
    expect(screen.getByText("Pratinjau, belum diunggah")).toBeInTheDocument();
    expect(screen.getByText("File dipilih: foto.png")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("submit-cover-modal-btn"));
    expect(screen.getByText("Mengunggah...")).toBeInTheDocument();

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(spy).toHaveBeenCalledWith(9, file);
    expect(onSuccess).toHaveBeenCalled();

    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  it("should stay open when upload fails and close without onSuccess on success", async () => {
    const onClose = vi.fn();
    const spy = vi
      .spyOn(lostFoundApi, "postLostFoundCover")
      .mockRejectedValueOnce(new Error("Terlalu besar"))
      .mockResolvedValueOnce("ok");
    const file = new File(["img"], "foto.jpg", { type: "image/jpeg" });

    renderWithProviders(<ChangeCoverModal show onClose={onClose} lostFound={lostFound} />);

    pickFile(file);
    fireEvent.click(screen.getByTestId("submit-cover-modal-btn"));
    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Terlalu besar"));
    await waitFor(() => expect(screen.getByText("Unggah foto")).toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("submit-cover-modal-btn"));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(spy).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByTestId("cancel-cover-modal-btn"));
    fireEvent.click(screen.getByTestId("close-cover-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import AddModal from "./AddModal";
import { renderWithProviders } from "../../../test-utils";
import lostFoundApi from "../api/lostFoundApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("AddModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({});
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({});
  });

  it("should render nothing when hidden", () => {
    renderWithProviders(<AddModal show={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId("add-lost-found-modal")).not.toBeInTheDocument();
  });

  it("should lock body scroll and close with button, cancel, and Escape", () => {
    const onClose = vi.fn();
    const { unmount } = renderWithProviders(<AddModal show onClose={onClose} />);

    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(screen.getByTestId("close-add-modal-btn"));
    fireEvent.click(screen.getByTestId("cancel-add-modal-btn"));
    fireEvent.keyDown(document, { key: "Enter" });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(3);

    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("should validate empty title and description", () => {
    renderWithProviders(<AddModal show onClose={vi.fn()} />);

    fireEvent.click(screen.getByTestId("submit-add-modal-btn"));
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Nama barang wajib diisi.");

    fireEvent.change(screen.getByTestId("add-title-input"), { target: { value: "Dompet" } });
    fireEvent.click(screen.getByTestId("submit-add-modal-btn"));
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
      "Deskripsi wajib diisi, misalnya ciri barang dan lokasi terakhir."
    );
  });

  it("should submit a found report, reset form, and call callbacks on success", async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const spy = vi.spyOn(lostFoundApi, "postLostFound").mockResolvedValue({ lost_found_id: 1 });

    renderWithProviders(<AddModal show onClose={onClose} onSuccess={onSuccess} />);

    fireEvent.click(screen.getByTestId("add-status-found"));
    fireEvent.change(screen.getByTestId("add-title-input"), { target: { value: " Botol " } });
    fireEvent.change(screen.getByTestId("add-description-input"), {
      target: { value: " Biru, GD 9 " },
    });
    fireEvent.click(screen.getByTestId("submit-add-modal-btn"));

    expect(screen.getByText("Menyimpan...")).toBeInTheDocument();
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(spy).toHaveBeenCalledWith("Botol", "Biru, GD 9", "found");
    expect(onSuccess).toHaveBeenCalled();
    expect(screen.getByTestId("add-title-input")).toHaveValue("");
  });

  it("should keep modal open when saving fails", async () => {
    const onClose = vi.fn();
    vi.spyOn(lostFoundApi, "postLostFound").mockRejectedValue(new Error("Data tidak valid"));

    renderWithProviders(<AddModal show onClose={onClose} />);

    fireEvent.change(screen.getByTestId("add-title-input"), { target: { value: "Kunci" } });
    fireEvent.change(screen.getByTestId("add-description-input"), {
      target: { value: "Parkiran" },
    });
    fireEvent.click(screen.getByTestId("submit-add-modal-btn"));

    await waitFor(() => {
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Data tidak valid");
    });
    await waitFor(() => expect(screen.getByText("Simpan laporan")).toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should close without onSuccess callback", async () => {
    const onClose = vi.fn();
    vi.spyOn(lostFoundApi, "postLostFound").mockResolvedValue({});

    renderWithProviders(<AddModal show onClose={onClose} />);

    fireEvent.change(screen.getByTestId("add-title-input"), { target: { value: "Kunci" } });
    fireEvent.change(screen.getByTestId("add-description-input"), {
      target: { value: "Parkiran" },
    });
    fireEvent.click(screen.getByTestId("submit-add-modal-btn"));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});

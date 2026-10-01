import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import ChangeModal from "./ChangeModal";
import { renderWithProviders } from "../../../test-utils";
import lostFoundApi from "../api/lostFoundApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

const lostFound = {
  id: 4,
  title: "Kalkulator",
  description: "Casio di GD 5",
  status: "lost",
  is_completed: 0,
};

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({});
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({});
  });

  it("should render nothing when hidden or without data", () => {
    const { rerender } = renderWithProviders(
      <ChangeModal show={false} onClose={vi.fn()} lostFound={lostFound} />
    );
    expect(screen.queryByTestId("edit-lost-found-modal")).not.toBeInTheDocument();

    rerender(<ChangeModal show onClose={vi.fn()} lostFound={null} />);
    expect(screen.queryByTestId("edit-lost-found-modal")).not.toBeInTheDocument();
  });

  it("should prefill form from report data", () => {
    renderWithProviders(
      <ChangeModal show onClose={vi.fn()} lostFound={{ ...lostFound, status: "found", is_completed: 1 }} />
    );

    expect(screen.getByTestId("edit-title-input")).toHaveValue("Kalkulator");
    expect(screen.getByTestId("edit-description-input")).toHaveValue("Casio di GD 5");
    expect(screen.getByTestId("edit-completed-toggle")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByTestId("edit-status-found").querySelector("input")).toBeChecked();
  });

  it("should fallback to empty values and lost status", () => {
    renderWithProviders(
      <ChangeModal show onClose={vi.fn()} lostFound={{ id: 1, status: "unknown" }} />
    );

    expect(screen.getByTestId("edit-title-input")).toHaveValue("");
    expect(screen.getByTestId("edit-description-input")).toHaveValue("");
    expect(screen.getByTestId("edit-status-lost").querySelector("input")).toBeChecked();
  });

  it("should validate empty fields", () => {
    renderWithProviders(<ChangeModal show onClose={vi.fn()} lostFound={lostFound} />);

    fireEvent.change(screen.getByTestId("edit-title-input"), { target: { value: " " } });
    fireEvent.click(screen.getByTestId("submit-edit-modal-btn"));
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Nama barang wajib diisi.");

    fireEvent.change(screen.getByTestId("edit-title-input"), { target: { value: "Baru" } });
    fireEvent.change(screen.getByTestId("edit-description-input"), { target: { value: "" } });
    fireEvent.click(screen.getByTestId("submit-edit-modal-btn"));
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Deskripsi wajib diisi.");
  });

  it("should submit changes including completion toggle", async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const spy = vi.spyOn(lostFoundApi, "putLostFound").mockResolvedValue("Berhasil");

    renderWithProviders(
      <ChangeModal show onClose={onClose} lostFound={lostFound} onSuccess={onSuccess} />
    );

    fireEvent.click(screen.getByTestId("edit-status-found"));
    fireEvent.click(screen.getByTestId("edit-completed-toggle"));
    fireEvent.change(screen.getByTestId("edit-title-input"), { target: { value: "Kalkulator fx" } });
    fireEvent.click(screen.getByTestId("submit-edit-modal-btn"));

    expect(screen.getByText("Menyimpan...")).toBeInTheDocument();
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(spy).toHaveBeenCalledWith(4, "Kalkulator fx", "Casio di GD 5", "found", 1);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should send unfinished status and close without onSuccess", async () => {
    const onClose = vi.fn();
    const spy = vi.spyOn(lostFoundApi, "putLostFound").mockResolvedValue("ok");

    renderWithProviders(<ChangeModal show onClose={onClose} lostFound={lostFound} />);
    fireEvent.click(screen.getByTestId("submit-edit-modal-btn"));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(spy).toHaveBeenCalledWith(4, "Kalkulator", "Casio di GD 5", "lost", 0);
  });

  it("should stay open when update fails and allow closing", async () => {
    const onClose = vi.fn();
    vi.spyOn(lostFoundApi, "putLostFound").mockRejectedValue(new Error("Gagal"));

    renderWithProviders(<ChangeModal show onClose={onClose} lostFound={lostFound} />);
    fireEvent.click(screen.getByTestId("submit-edit-modal-btn"));

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal"));
    await waitFor(() => expect(screen.getByText("Simpan perubahan")).toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("cancel-edit-modal-btn"));
    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

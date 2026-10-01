import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor, within, act } from "@testing-library/react";
import HomePage, { filterLostFounds } from "./HomePage";
import { renderWithProviders } from "../../../test-utils";
import lostFoundApi from "../api/lostFoundApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const profile = { id: 1, name: "Jeremy", email: "jeremy@del.ac.id" };
const items = [
  {
    id: 1,
    user_id: 1,
    title: "Dompet coklat",
    description: "Kantin",
    status: "lost",
    is_completed: 0,
    cover: null,
    created_at: "2026-09-28T07:49:32.000000Z",
    author: { name: "Jeremy" },
  },
  {
    id: 2,
    user_id: 2,
    title: "Botol biru",
    description: "Gedung 9",
    status: "found",
    is_completed: 1,
    cover: null,
    created_at: "2026-09-27T07:49:32.000000Z",
    author: { name: "Maria" },
  },
  {
    id: 3,
    user_id: 3,
    title: "Kunci motor",
    description: null,
    status: "found",
    is_completed: 0,
    cover: null,
    created_at: "2026-09-26T07:49:32.000000Z",
    author: null,
  },
];

function metricValue(index) {
  return screen.getByTestId(`metric-${index}`).textContent;
}

describe("filterLostFounds", () => {
  it("should filter by type, completion, and keyword including author", () => {
    expect(filterLostFounds(items, { type: "", completion: "", query: "" })).toHaveLength(3);
    expect(filterLostFounds(items, { type: "found", completion: "", query: "" })).toHaveLength(2);
    expect(filterLostFounds(items, { type: "", completion: "1", query: "" })).toEqual([items[1]]);
    expect(filterLostFounds(items, { type: "", completion: "0", query: "" })).toHaveLength(2);
    expect(filterLostFounds(items, { type: "", completion: "", query: " maria " })).toEqual([
      items[1],
    ]);
    expect(filterLostFounds(items, { type: "", completion: "", query: "kunci" })).toEqual([
      items[2],
    ]);
  });
});

describe("HomePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockClear();
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({});
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({});
  });

  it("should render nothing without profile", async () => {
    vi.spyOn(lostFoundApi, "getLostFounds").mockResolvedValue([]);
    const { container } = renderWithProviders(<HomePage />, { preloadedState: { profile: null } });
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(container.firstChild).toBeNull();
  });

  it("should show loading state while fetching", () => {
    vi.spyOn(lostFoundApi, "getLostFounds").mockReturnValue(new Promise(() => {}));
    renderWithProviders(<HomePage />, { preloadedState: { profile } });
    expect(screen.getByTestId("list-loading")).toBeInTheDocument();
  });

  it("should show empty state and open add modal from it", async () => {
    vi.spyOn(lostFoundApi, "getLostFounds").mockResolvedValue([]);
    renderWithProviders(<HomePage />, { preloadedState: { profile } });

    await waitFor(() => expect(screen.getByText("Belum ada laporan.")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("empty-add-btn"));
    expect(screen.getByTestId("add-lost-found-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-add-modal-btn"));
    expect(screen.queryByTestId("add-lost-found-modal")).not.toBeInTheDocument();
  });

  it("should treat null list as empty", async () => {
    vi.spyOn(lostFoundApi, "getLostFounds").mockResolvedValue(null);
    renderWithProviders(<HomePage />, { preloadedState: { profile } });
    await waitFor(() => expect(screen.getByTestId("list-empty")).toBeInTheDocument());
    expect(metricValue(0)).toBe("0");
  });

  it("should render metrics and cards, then filter and reset", async () => {
    vi.spyOn(lostFoundApi, "getLostFounds").mockResolvedValue(items);
    renderWithProviders(<HomePage />, { preloadedState: { profile } });

    await waitFor(() => expect(screen.getByTestId("lost-found-grid")).toBeInTheDocument());
    expect(metricValue(0)).toBe("3");
    expect(metricValue(1)).toBe("1");
    expect(metricValue(2)).toBe("2");
    expect(metricValue(3)).toBe("1");

    // hanya pemilik yang punya tombol ubah/hapus
    expect(screen.getByTestId("edit-lost-found-1")).toBeInTheDocument();
    expect(screen.queryByTestId("edit-lost-found-2")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("type-found-btn"));
    expect(screen.queryByTestId("lost-found-card-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("type-found-btn")).toHaveAttribute("aria-pressed", "true");

    fireEvent.change(screen.getByTestId("completion-select"), { target: { value: "1" } });
    expect(within(screen.getByTestId("lost-found-grid")).getByText("Botol biru")).toBeInTheDocument();
    expect(screen.queryByTestId("lost-found-card-3")).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "tidak ada" } });
    expect(screen.getByText("Tidak ada laporan yang cocok.")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("reset-filter-btn"));
    expect(screen.getByTestId("lost-found-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("search-input")).toHaveValue("");
    expect(screen.getByTestId("completion-select")).toHaveValue("");
  });

  it("should switch scope to my reports using is_me filter", async () => {
    const spy = vi.spyOn(lostFoundApi, "getLostFounds").mockResolvedValue(items);
    renderWithProviders(<HomePage />, { preloadedState: { profile } });

    await waitFor(() => expect(spy).toHaveBeenCalledWith({}));
    fireEvent.click(screen.getByTestId("scope-me-btn"));
    await waitFor(() => expect(spy).toHaveBeenCalledWith({ is_me: 1 }));
    expect(screen.getByTestId("scope-me-btn")).toHaveAttribute("aria-pressed", "true");
  });

  it("should navigate to detail page", async () => {
    vi.spyOn(lostFoundApi, "getLostFounds").mockResolvedValue(items);
    renderWithProviders(<HomePage />, { preloadedState: { profile } });

    await waitFor(() => expect(screen.getByTestId("open-lost-found-2")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("open-lost-found-2"));
    expect(mockNavigate).toHaveBeenCalledWith("/lost-founds/2");
  });

  it("should add a report and reload list", async () => {
    const getSpy = vi.spyOn(lostFoundApi, "getLostFounds").mockResolvedValue(items);
    vi.spyOn(lostFoundApi, "postLostFound").mockResolvedValue({ lost_found_id: 4 });
    renderWithProviders(<HomePage />, { preloadedState: { profile } });

    await waitFor(() => expect(getSpy).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByTestId("add-lost-found-btn"));
    fireEvent.change(screen.getByTestId("add-title-input"), { target: { value: "Payung" } });
    fireEvent.change(screen.getByTestId("add-description-input"), { target: { value: "Hitam" } });
    fireEvent.click(screen.getByTestId("submit-add-modal-btn"));

    await waitFor(() => expect(getSpy).toHaveBeenCalledTimes(2));
    expect(screen.queryByTestId("add-lost-found-modal")).not.toBeInTheDocument();
  });

  it("should edit a report from its card", async () => {
    const getSpy = vi.spyOn(lostFoundApi, "getLostFounds").mockResolvedValue(items);
    const putSpy = vi.spyOn(lostFoundApi, "putLostFound").mockResolvedValue("ok");
    renderWithProviders(<HomePage />, { preloadedState: { profile } });

    await waitFor(() => expect(screen.getByTestId("edit-lost-found-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("edit-lost-found-1"));
    expect(screen.getByTestId("edit-title-input")).toHaveValue("Dompet coklat");
    fireEvent.click(screen.getByTestId("submit-edit-modal-btn"));

    await waitFor(() => expect(putSpy).toHaveBeenCalledWith(1, "Dompet coklat", "Kantin", "lost", 0));
    await waitFor(() => expect(getSpy).toHaveBeenCalledTimes(2));
    expect(screen.queryByTestId("edit-lost-found-modal")).not.toBeInTheDocument();
  });

  it("should delete report after confirmation and reload", async () => {
    const getSpy = vi.spyOn(lostFoundApi, "getLostFounds").mockResolvedValue(items);
    const delSpy = vi.spyOn(lostFoundApi, "deleteLostFound").mockResolvedValue("Terhapus");
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });

    const { store } = renderWithProviders(<HomePage />, { preloadedState: { profile } });

    await waitFor(() => expect(screen.getByTestId("delete-lost-found-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("delete-lost-found-1"));

    await waitFor(() => expect(delSpy).toHaveBeenCalledWith(1));
    await waitFor(() => expect(getSpy).toHaveBeenCalledTimes(2));
    expect(store.getState().isLostFoundDeleted).toBe(false);
    expect(store.getState().isLostFoundDelete).toBe(false);
  });

  it("should not delete when confirmation is cancelled", async () => {
    vi.spyOn(lostFoundApi, "getLostFounds").mockResolvedValue(items);
    const delSpy = vi.spyOn(lostFoundApi, "deleteLostFound").mockResolvedValue("x");
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    renderWithProviders(<HomePage />, { preloadedState: { profile } });

    await waitFor(() => expect(screen.getByTestId("delete-lost-found-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("delete-lost-found-1"));

    await waitFor(() => expect(toolsHelper.showConfirmDialog).toHaveBeenCalled());
    expect(delSpy).not.toHaveBeenCalled();
  });

  it("should not update loading state after unmount", async () => {
    let resolve;
    vi.spyOn(lostFoundApi, "getLostFounds").mockReturnValue(
      new Promise((r) => {
        resolve = r;
      })
    );
    const { unmount } = renderWithProviders(<HomePage />, { preloadedState: { profile } });
    unmount();
    resolve([]);
    await Promise.resolve();
    expect(lostFoundApi.getLostFounds).toHaveBeenCalled();
  });
});

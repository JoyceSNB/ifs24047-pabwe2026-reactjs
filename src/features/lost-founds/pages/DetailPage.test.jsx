import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import DetailPage from "./DetailPage";
import { renderWithProviders } from "../../../test-utils";
import lostFoundApi from "../api/lostFoundApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

const mockNavigate = vi.fn();
let mockId = "5";
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: mockId }),
  };
});

const profile = { id: 1, name: "Jeremy" };
const report = {
  id: 5,
  user_id: 1,
  title: "Dompet coklat",
  description: "Isi KTM",
  status: "lost",
  is_completed: 0,
  cover: "img/lost-founds/cover/5.png",
  created_at: "2026-09-28T07:49:32.000000Z",
  updated_at: "2026-09-29T07:49:32.000000Z",
  author: { name: "Jeremy", photo: "https://example.com/j.png" },
};

describe("DetailPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockClear();
    mockId = "5";
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({});
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({});
  });

  it("should show loading while report is not loaded", () => {
    vi.spyOn(lostFoundApi, "getLostFoundById").mockReturnValue(new Promise(() => {}));
    renderWithProviders(<DetailPage />, { preloadedState: { profile, lostFound: null } });
    expect(screen.getByTestId("detail-loading")).toBeInTheDocument();
  });

  it("should show loading when store holds another report or profile is missing", () => {
    vi.spyOn(lostFoundApi, "getLostFoundById").mockReturnValue(new Promise(() => {}));
    const { unmount } = renderWithProviders(<DetailPage />, {
      preloadedState: { profile, lostFound: { ...report, id: 99 } },
    });
    expect(screen.getByTestId("detail-loading")).toBeInTheDocument();
    unmount();

    renderWithProviders(<DetailPage />, { preloadedState: { profile: null, lostFound: report } });
    expect(screen.getByTestId("detail-loading")).toBeInTheDocument();
  });

  it("should render owner view with cover, author photo and actions", async () => {
    const spy = vi.spyOn(lostFoundApi, "getLostFoundById").mockResolvedValue(report);
    renderWithProviders(<DetailPage />, { preloadedState: { profile } });

    await waitFor(() => expect(screen.getByText("Dompet coklat")).toBeInTheDocument());
    expect(spy).toHaveBeenCalledWith("5");
    expect(screen.getByTestId("detail-cover")).toHaveAttribute(
      "src",
      "https://open-api.delcom.org/img/lost-founds/cover/5.png"
    );
    expect(screen.getByAltText("Jeremy")).toHaveAttribute("src", "https://example.com/j.png");
    expect(screen.getByText("(kamu)")).toBeInTheDocument();
    expect(screen.getByText("Belum selesai")).toBeInTheDocument();
    expect(screen.getByTestId("edit-cover-btn")).toBeInTheDocument();
  });

  it("should render non-owner view with placeholders", async () => {
    vi.spyOn(lostFoundApi, "getLostFoundById").mockResolvedValue({
      ...report,
      user_id: 2,
      status: "found",
      is_completed: 1,
      cover: null,
      description: "",
      author: null,
    });
    renderWithProviders(<DetailPage />, { preloadedState: { profile } });

    await waitFor(() => expect(screen.getByTestId("not-owner-note")).toBeInTheDocument());
    expect(screen.getByTestId("detail-no-cover")).toBeInTheDocument();
    expect(screen.getByText("Pelapor belum menambahkan deskripsi.")).toBeInTheDocument();
    expect(screen.getByText("Pengguna")).toBeInTheDocument();
    expect(screen.getByText("Selesai")).toBeInTheDocument();
    expect(screen.queryByTestId("delete-detail-btn")).not.toBeInTheDocument();
  });

  it("should redirect home when report is not found", async () => {
    vi.spyOn(lostFoundApi, "getLostFoundById").mockRejectedValue(new Error("404"));
    renderWithProviders(<DetailPage />, { preloadedState: { profile, lostFound: report } });

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
  });

  it("should open and close cover and edit modals", async () => {
    vi.spyOn(lostFoundApi, "getLostFoundById").mockResolvedValue(report);
    renderWithProviders(<DetailPage />, { preloadedState: { profile } });

    await waitFor(() => expect(screen.getByTestId("edit-cover-btn")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("edit-cover-btn"));
    expect(screen.getByTestId("change-cover-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-cover-modal-btn"));
    expect(screen.queryByTestId("change-cover-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("edit-detail-btn"));
    expect(screen.getByTestId("edit-lost-found-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    expect(screen.queryByTestId("edit-lost-found-modal")).not.toBeInTheDocument();
  });

  it("should reload detail after a successful edit", async () => {
    const getSpy = vi.spyOn(lostFoundApi, "getLostFoundById").mockResolvedValue(report);
    vi.spyOn(lostFoundApi, "putLostFound").mockResolvedValue("ok");
    renderWithProviders(<DetailPage />, { preloadedState: { profile } });

    await waitFor(() => expect(screen.getByTestId("edit-detail-btn")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("edit-detail-btn"));
    fireEvent.click(screen.getByTestId("submit-edit-modal-btn"));

    await waitFor(() => expect(getSpy).toHaveBeenCalledTimes(2));
  });

  it("should delete after confirmation and go back home", async () => {
    vi.spyOn(lostFoundApi, "getLostFoundById").mockResolvedValue(report);
    const delSpy = vi.spyOn(lostFoundApi, "deleteLostFound").mockResolvedValue("ok");
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });

    const { store } = renderWithProviders(<DetailPage />, { preloadedState: { profile } });

    await waitFor(() => expect(screen.getByTestId("delete-detail-btn")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("delete-detail-btn"));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
    expect(delSpy).toHaveBeenCalledWith(5);
    expect(store.getState().isLostFoundDeleted).toBe(false);
  });

  it("should keep report when delete is cancelled", async () => {
    vi.spyOn(lostFoundApi, "getLostFoundById").mockResolvedValue(report);
    const delSpy = vi.spyOn(lostFoundApi, "deleteLostFound").mockResolvedValue("ok");
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    renderWithProviders(<DetailPage />, { preloadedState: { profile } });

    await waitFor(() => expect(screen.getByTestId("delete-detail-btn")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("delete-detail-btn"));

    await waitFor(() => expect(toolsHelper.showConfirmDialog).toHaveBeenCalled());
    expect(delSpy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

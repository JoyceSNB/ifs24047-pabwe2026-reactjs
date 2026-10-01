import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import App from "./App";
import { renderWithProviders } from "./test-utils";
import apiHelper from "./helpers/apiHelper";
import userApi from "./features/users/api/userApi";
import lostFoundApi from "./features/lost-founds/api/lostFoundApi";

const profile = { id: 1, name: "Jeremy", email: "jeremy@del.ac.id" };

function renderAt(path, preloadedState = {}) {
  return renderWithProviders(<App />, { initialEntries: [path], preloadedState });
}

describe("App routing", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("token");
    vi.spyOn(userApi, "getProfile").mockResolvedValue(profile);
    vi.spyOn(userApi, "getUsers").mockResolvedValue([]);
    vi.spyOn(lostFoundApi, "getLostFounds").mockResolvedValue([]);
    vi.spyOn(lostFoundApi, "getStatsDaily").mockResolvedValue({});
  });

  it("should render login page inside auth layout", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    renderAt("/auth/login");
    expect(screen.getByText("Delcom Lost & Found")).toBeInTheDocument();
    expect(screen.getByTestId("login-email-input")).toBeInTheDocument();
  });

  it("should render register page", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    renderAt("/auth/register");
    expect(screen.getByText("Daftar Baru")).toBeInTheDocument();
  });

  it("should render home page for signed-in user", async () => {
    renderAt("/", { profile });
    await waitFor(() => expect(screen.getByText("Laporan barang")).toBeInTheDocument());
  });

  it("should render detail route", async () => {
    vi.spyOn(lostFoundApi, "getLostFoundById").mockResolvedValue({
      id: 3,
      user_id: 1,
      title: "Payung hitam",
      status: "found",
      is_completed: 0,
    });
    renderAt("/lost-founds/3", { profile });
    await waitFor(() => expect(screen.getByText("Payung hitam")).toBeInTheDocument());
  });

  it("should render stats route", async () => {
    renderAt("/stats", { profile });
    await waitFor(() => expect(screen.getByText("Statistik laporan")).toBeInTheDocument());
  });

  it("should render users and profile routes", async () => {
    const { unmount } = renderAt("/users", { profile });
    await waitFor(() => expect(userApi.getUsers).toHaveBeenCalled());
    unmount();

    renderAt("/profile", { profile });
    await waitFor(() => expect(screen.getAllByText("Jeremy").length).toBeGreaterThan(0));
  });

  it("should render 404 page for unknown route", () => {
    renderAt("/random-invalid-route");
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Halaman Tidak Ditemukan")).toBeInTheDocument();
  });
});

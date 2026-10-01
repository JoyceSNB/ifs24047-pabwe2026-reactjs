import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import LostFoundLayout from "./LostFoundLayout";
import { renderWithProviders } from "../../../test-utils";
import apiHelper from "../../../helpers/apiHelper";
import userApi from "../../users/api/userApi";
import authApi from "../../auth/api/authApi";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const profile = { id: 1, name: "Jeremy", email: "jeremy@del.ac.id" };

function renderLayout(preloadedState = {}) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<LostFoundLayout />}>
        <Route index element={<p>Konten halaman</p>} />
      </Route>
    </Routes>,
    { preloadedState }
  );
}

describe("LostFoundLayout", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockClear();
  });

  it("should redirect to login when there is no token", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    renderLayout({ profile: null });

    expect(mockNavigate).toHaveBeenCalledWith("/auth/login");
    expect(screen.getByText("Memeriksa sesi masuk...")).toBeInTheDocument();
  });

  it("should load profile and render navbar, sidebar and outlet", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("token");
    const spy = vi.spyOn(userApi, "getProfile").mockResolvedValue(profile);

    renderLayout({ profile: null });

    await waitFor(() => {
      expect(screen.getByText("Konten halaman")).toBeInTheDocument();
    });
    expect(spy).toHaveBeenCalled();
    expect(screen.getByText("Delcom Lost & Found")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalledWith("/auth/login");
  });

  it("should clear token and redirect when profile cannot be loaded", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("expired");
    vi.spyOn(userApi, "getProfile").mockRejectedValue(new Error("Unauthenticated"));
    const putSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

    renderLayout({ profile: null });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/auth/login");
    });
    expect(putSpy).toHaveBeenCalledWith("");
  });

  it("should toggle mobile sidebar and close it from backdrop", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("token");
    vi.spyOn(userApi, "getProfile").mockResolvedValue(profile);

    renderLayout({ profile });

    fireEvent.click(screen.getByTestId("toggle-sidebar-btn"));
    expect(screen.getByTestId("sidebar-backdrop")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("sidebar-backdrop"));
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
    await waitFor(() => expect(userApi.getProfile).toHaveBeenCalled());
  });

  it("should logout and redirect to login", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("token");
    vi.spyOn(userApi, "getProfile").mockResolvedValue(profile);
    vi.spyOn(authApi, "postLogout").mockResolvedValue("ok");
    vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

    renderLayout({ profile });

    fireEvent.click(screen.getByTestId("profile-dropdown-button"));
    fireEvent.click(screen.getByTestId("dropdown-logout-button"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/auth/login");
    });
  });
});

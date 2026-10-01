import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import NavbarComponent from "./NavbarComponent";
import { renderWithProviders } from "../../../test-utils";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const profile = { id: 1, name: "jeremy", email: "jeremy@del.ac.id", photo: null };

function setup(props = {}) {
  const handlers = { handleLogout: vi.fn(), onToggleSidebar: vi.fn() };
  renderWithProviders(
    <NavbarComponent profile={profile} isSidebarOpen={false} {...handlers} {...props} />
  );
  return handlers;
}

describe("NavbarComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render brand, initial avatar and user info", () => {
    setup();
    expect(screen.getByText("Delcom Lost & Found")).toBeInTheDocument();
    expect(screen.getByText("J")).toBeInTheDocument();
    expect(screen.getByText("jeremy@del.ac.id")).toBeInTheDocument();
    expect(screen.getByLabelText("Buka menu")).toBeInTheDocument();
  });

  it("should render photo, close icon label and fallbacks", () => {
    setup({
      isSidebarOpen: true,
      profile: { id: 1, name: "Jeremy", photo: "https://example.com/p.png" },
    });
    expect(screen.getByAltText("Jeremy")).toHaveAttribute("src", "https://example.com/p.png");
    expect(screen.getByLabelText("Tutup menu")).toBeInTheDocument();
  });

  it("should use default name and initial when profile is empty", () => {
    setup({ profile: {} });
    expect(screen.getByText("Pengguna")).toBeInTheDocument();
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("should toggle sidebar", () => {
    const { onToggleSidebar } = setup();
    fireEvent.click(screen.getByTestId("toggle-sidebar-btn"));
    expect(onToggleSidebar).toHaveBeenCalled();
  });

  it("should open dropdown, go to profile, and logout", () => {
    const { handleLogout } = setup();

    fireEvent.click(screen.getByTestId("profile-dropdown-button"));
    expect(screen.getByTestId("profile-dropdown-menu")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("dropdown-profile-link"));
    expect(mockNavigate).toHaveBeenCalledWith("/profile");
    expect(screen.queryByTestId("profile-dropdown-menu")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("profile-dropdown-button"));
    fireEvent.click(screen.getByTestId("dropdown-logout-button"));
    expect(handleLogout).toHaveBeenCalled();
  });

  it("should close dropdown when clicking outside but not inside", () => {
    setup();
    fireEvent.click(screen.getByTestId("profile-dropdown-button"));

    fireEvent.mouseDown(screen.getByTestId("profile-dropdown-menu"));
    expect(screen.getByTestId("profile-dropdown-menu")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId("profile-dropdown-menu")).not.toBeInTheDocument();
  });
});

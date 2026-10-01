import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import SidebarComponent, { NAV_ITEMS } from "./SidebarComponent";
import { renderWithProviders } from "../../../test-utils";

describe("SidebarComponent", () => {
  it("should render all menu items and mark the active one", () => {
    renderWithProviders(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />, {
      initialEntries: ["/stats"],
    });

    NAV_ITEMS.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
    expect(screen.getByText("Statistik").closest("a").className).toContain("bg-teal-800");
    expect(screen.getByText("Laporan").closest("a").className).not.toContain("bg-teal-800");
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
    expect(screen.getByTestId("sidebar").className).toContain("-translate-x-full");
  });

  it("should show backdrop when open and close on backdrop or link click", () => {
    const onCloseMobile = vi.fn();
    renderWithProviders(<SidebarComponent isSidebarOpen onCloseMobile={onCloseMobile} />);

    expect(screen.getByTestId("sidebar").className).toContain("translate-x-0");
    fireEvent.click(screen.getByTestId("sidebar-backdrop"));
    fireEvent.click(screen.getByText("Pengguna"));

    expect(onCloseMobile).toHaveBeenCalledTimes(2);
  });
});

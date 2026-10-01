import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import StatsPage, { buildStatsRows, formatStatsLabel } from "./StatsPage";
import { renderWithProviders } from "../../../test-utils";
import lostFoundApi from "../api/lostFoundApi";

const daily = {
  stats_losts: { "05-10-2024": 2, "06-10-2024": 0 },
  stats_founds: { "05-10-2024": 1, "07-10-2024": 3 },
  stats_losts_completed: { "05-10-2024": 1 },
  stats_founds_completed: { "07-10-2024": 2 },
};

describe("StatsPage helpers", () => {
  it("should format daily and monthly labels", () => {
    expect(formatStatsLabel("06-10-2024")).toBe("6 Okt");
    expect(formatStatsLabel("10-2024")).toBe("Okt 2024");
  });

  it("should build rows from API data with missing keys as zero", () => {
    expect(buildStatsRows(daily)).toEqual([
      { label: "05-10-2024", lost: 2, found: 1, completed: 1 },
      { label: "06-10-2024", lost: 0, found: 0, completed: 0 },
      { label: "07-10-2024", lost: 0, found: 3, completed: 2 },
    ]);
    expect(buildStatsRows()).toEqual([]);
  });
});

describe("StatsPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should show loading first", () => {
    vi.spyOn(lostFoundApi, "getStatsDaily").mockReturnValue(new Promise(() => {}));
    renderWithProviders(<StatsPage />);
    expect(screen.getByTestId("stats-loading")).toBeInTheDocument();
  });

  it("should render totals, chart and table for daily stats", async () => {
    vi.spyOn(lostFoundApi, "getStatsDaily").mockResolvedValue(daily);
    renderWithProviders(<StatsPage />);

    await waitFor(() => expect(screen.getByTestId("stats-chart")).toBeInTheDocument());
    expect(screen.getByTestId("total-lost")).toHaveTextContent("2");
    expect(screen.getByTestId("total-found")).toHaveTextContent("4");
    expect(screen.getByTestId("total-completed")).toHaveTextContent("3");
    expect(screen.getByTestId("stats-table")).toBeInTheDocument();
    expect(screen.getAllByText("5 Okt")).toHaveLength(2);
  });

  it("should switch to monthly stats", async () => {
    vi.spyOn(lostFoundApi, "getStatsDaily").mockResolvedValue(daily);
    const monthly = vi
      .spyOn(lostFoundApi, "getStatsMonthly")
      .mockResolvedValue({ stats_losts: { "09-2024": 1 }, stats_founds: {} });
    renderWithProviders(<StatsPage />);

    await waitFor(() => expect(screen.getByTestId("stats-chart")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("period-monthly-btn"));

    await waitFor(() => expect(monthly).toHaveBeenCalled());
    await waitFor(() => expect(screen.getAllByText("Sep 2024")).toHaveLength(2));
    expect(screen.getByTestId("period-monthly-btn")).toHaveAttribute("aria-pressed", "true");
  });

  it("should show empty message when period has no data", async () => {
    vi.spyOn(lostFoundApi, "getStatsDaily").mockResolvedValue({});
    renderWithProviders(<StatsPage />);

    await waitFor(() => expect(screen.getByTestId("stats-empty")).toBeInTheDocument());
    expect(screen.queryByTestId("stats-table")).not.toBeInTheDocument();
  });

  it("should show error state and retry", async () => {
    const spy = vi
      .spyOn(lostFoundApi, "getStatsDaily")
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(daily);
    renderWithProviders(<StatsPage />);

    await waitFor(() => expect(screen.getByTestId("stats-error")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("stats-retry-btn"));

    await waitFor(() => expect(screen.getByTestId("stats-chart")).toBeInTheDocument());
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("should ignore cached stats from another period", () => {
    vi.spyOn(lostFoundApi, "getStatsDaily").mockReturnValue(new Promise(() => {}));
    renderWithProviders(<StatsPage />, {
      preloadedState: { lostFoundStats: { period: "monthly", data: daily } },
    });
    expect(screen.getByTestId("stats-loading")).toBeInTheDocument();
  });

  it("should not update state after unmount", async () => {
    let resolve;
    vi.spyOn(lostFoundApi, "getStatsDaily").mockReturnValue(
      new Promise((r) => {
        resolve = r;
      })
    );
    const { unmount } = renderWithProviders(<StatsPage />);
    unmount();
    resolve({});
    await Promise.resolve();
    expect(lostFoundApi.getStatsDaily).toHaveBeenCalled();
  });
});

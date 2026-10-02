import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

function Broken() {
  throw new Error("Gagal memuat halaman");
}

describe("ErrorBoundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <p>Konten aman</p>
      </ErrorBoundary>
    );
    expect(screen.getByText("Konten aman")).toBeInTheDocument();
  });

  it("should render fallback with main landmark and heading when a child throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>
    );

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Halaman gagal dimuat");
    expect(screen.getByTestId("error-reload-link")).toHaveAttribute("href", window.location.pathname);
  });
});
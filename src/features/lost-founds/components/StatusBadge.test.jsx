import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, CompletionBadge, STATUS_LABEL } from "./StatusBadge";

describe("StatusBadge", () => {
  it("should render lost label", () => {
    render(<StatusBadge status="lost" />);
    expect(screen.getByTestId("status-badge")).toHaveTextContent(STATUS_LABEL.lost);
    expect(screen.getByTestId("status-badge").className).toContain("bg-rose-50");
  });

  it("should render found label with large size", () => {
    render(<StatusBadge status="found" size="lg" />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveTextContent(STATUS_LABEL.found);
    expect(badge.className).toContain("text-sm");
  });
});

describe("CompletionBadge", () => {
  it("should render completed state", () => {
    render(<CompletionBadge isCompleted />);
    expect(screen.getByTestId("completion-badge")).toHaveTextContent("Selesai");
  });

  it("should render unfinished state", () => {
    render(<CompletionBadge isCompleted={false} />);
    expect(screen.getByTestId("completion-badge")).toHaveTextContent("Belum selesai");
  });
});

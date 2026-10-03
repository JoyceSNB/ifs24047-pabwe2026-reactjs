import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LostFoundCard from "./LostFoundCard";

const baseItem = {
  id: 7,
  user_id: 1,
  title: "Dompet coklat",
  description: "Hilang di kantin",
  status: "lost",
  is_completed: 0,
  cover: "https://example.com/dompet.png",
  created_at: "2026-09-28T07:49:32.000000Z",
  author: { name: "Jeremy", photo: null },
};

function setup(props = {}) {
  const handlers = { onView: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() };
  render(<LostFoundCard lostFound={baseItem} isOwner {...handlers} {...props} />);
  return handlers;
}

describe("LostFoundCard", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should render report information with cover", () => {
    setup();
    expect(screen.getByText("Dompet coklat")).toBeInTheDocument();
    expect(screen.getByText("Hilang di kantin")).toBeInTheDocument();
    expect(screen.getByText("No. 7")).toBeInTheDocument();
    expect(screen.getByAltText("Dompet coklat")).toHaveAttribute(
      "src",
      "https://example.com/dompet.png"
    );
    expect(screen.getByText(/Dilaporkan Jeremy/)).toBeInTheDocument();
    expect(screen.queryByTestId("completion-badge")).not.toBeInTheDocument();
  });

  it("should call handlers for owner actions", () => {
    const { onView, onEdit, onDelete } = setup();

    fireEvent.click(screen.getByTestId("view-lost-found-7"));
    fireEvent.click(screen.getByTestId("open-lost-found-7"));
    fireEvent.click(screen.getByTestId("edit-lost-found-7"));
    fireEvent.click(screen.getByTestId("delete-lost-found-7"));

    expect(onView).toHaveBeenCalledTimes(2);
    expect(onView).toHaveBeenCalledWith(7);
    expect(onEdit).toHaveBeenCalledWith(baseItem);
    expect(onDelete).toHaveBeenCalledWith(7);
  });

  it("should hide owner actions and show placeholders for other users' reports", () => {
    setup({
      isOwner: false,
      lostFound: {
        ...baseItem,
        status: "found",
        is_completed: 1,
        cover: null,
        description: "",
        author: null,
      },
    });

    expect(screen.queryByTestId("edit-lost-found-7")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-lost-found-7")).not.toBeInTheDocument();
    expect(screen.getByText("Belum ada foto")).toBeInTheDocument();
    expect(screen.getByTestId("completion-badge")).toHaveTextContent("Selesai");
    expect(screen.getByText(/Dilaporkan Pengguna/)).toBeInTheDocument();
  });

  it("should load the image lazily by default and eagerly with priority", () => {
    const { unmount } = render(
      <LostFoundCard lostFound={baseItem} isOwner onView={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.getByAltText("Dompet coklat")).toHaveAttribute("loading", "lazy");
    unmount();

    render(
      <LostFoundCard
        lostFound={baseItem}
        isOwner
        priority
        onView={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const img = screen.getByAltText("Dompet coklat");
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("should request a 640px optimized image in production and keep the width attribute", () => {
    vi.stubEnv("PROD", true);
    setup({ lostFound: { ...baseItem, cover: "img/lost-founds/cover/7.png" } });

    const img = screen.getByAltText("Dompet coklat");
    expect(img.getAttribute("src")).toContain("/_vercel/image?url=");
    expect(img.getAttribute("src")).toContain("&w=640&q=75");
    expect(img).toHaveAttribute("width", "400");
  });
});
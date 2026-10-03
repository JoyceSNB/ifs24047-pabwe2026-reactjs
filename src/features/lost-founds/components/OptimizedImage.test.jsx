import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OptimizedImage from "./OptimizedImage";

const ORIGINAL = "https://open-api.delcom.org/img/lost-founds/cover/1.png";
const OPTIMIZED = `/_vercel/image?url=${encodeURIComponent(ORIGINAL)}&w=640&q=75`;

describe("OptimizedImage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should render nothing when there is no path", () => {
    const { container } = render(<OptimizedImage path={null} alt="Foto" />);
    expect(container.firstChild).toBeNull();
  });

  it("should use the original url outside production and pass extra props", () => {
    render(
      <OptimizedImage
        path="img/lost-founds/cover/1.png"
        alt="Foto"
        className="foto"
        data-testid="foto"
      />
    );
    const img = screen.getByTestId("foto");
    expect(img).toHaveAttribute("src", ORIGINAL);
    expect(img).toHaveAttribute("alt", "Foto");
    expect(img).toHaveClass("foto");
  });

  it("should use the optimizer in production and fall back to the original on error", () => {
    vi.stubEnv("PROD", true);
    render(<OptimizedImage path="img/lost-founds/cover/1.png" optimizedWidth={640} alt="Foto" />);

    const img = screen.getByAltText("Foto");
    expect(img).toHaveAttribute("src", OPTIMIZED);

    fireEvent.error(img);
    expect(screen.getByAltText("Foto")).toHaveAttribute("src", ORIGINAL);

    // error kedua tidak mengulang atau mengubah apa pun
    fireEvent.error(screen.getByAltText("Foto"));
    expect(screen.getByAltText("Foto")).toHaveAttribute("src", ORIGINAL);
  });

  it("should pass width and height to the img without changing the requested optimizer size", () => {
    vi.stubEnv("PROD", true);
    render(
      <OptimizedImage
        path="img/lost-founds/cover/1.png"
        optimizedWidth={828}
        width={800}
        height={600}
        alt="Foto"
      />
    );

    const img = screen.getByAltText("Foto");
    expect(img).toHaveAttribute("width", "800");
    expect(img).toHaveAttribute("height", "600");
    expect(img.getAttribute("src")).toContain("&w=828&q=75");
  });
});
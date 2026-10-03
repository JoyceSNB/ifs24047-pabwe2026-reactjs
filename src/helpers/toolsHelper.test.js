import { describe, it, expect, vi, afterEach } from "vitest";
import Swal from "sweetalert2";
import {
  showErrorDialog,
  showWarningDialog,
  showSuccessDialog,
  showConfirmDialog,
  formatDate,
  formatShortDate,
  toApiDateTime,
  toImageUrl,
  toOptimizedImageUrl,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
    close: vi.fn(),
  },
}));

describe("toolsHelper", () => {
  it("should call Swal.fire for showErrorDialog and handle confirmation", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    await showErrorDialog("Error test");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Terjadi Kesalahan",
        text: "Error test",
        icon: "error",
      })
    );
    expect(Swal.close).toHaveBeenCalled();

    // Not confirmed branch
    Swal.fire.mockResolvedValue({ isConfirmed: false });
    await showErrorDialog("Error test");
  });

  it("should call Swal.fire for showWarningDialog and handle confirmation", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    await showWarningDialog("Warning test");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Peringatan",
        text: "Warning test",
        icon: "warning",
      })
    );
    expect(Swal.close).toHaveBeenCalled();

    Swal.fire.mockResolvedValue({ isConfirmed: false });
    await showWarningDialog("Warning test");
  });

  it("should call Swal.fire for showSuccessDialog and handle confirmation", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    await showSuccessDialog("Success test");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Tindakan Berhasil",
        text: "Success test",
        icon: "success",
      })
    );
    expect(Swal.close).toHaveBeenCalled();

    Swal.fire.mockResolvedValue({ isConfirmed: false });
    await showSuccessDialog("Success test");
  });

  it("should call Swal.fire for showConfirmDialog", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    const res = await showConfirmDialog("Confirm test?");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Konfirmasi",
        text: "Confirm test?",
        icon: "question",
      })
    );
    expect(res.isConfirmed).toBe(true);
  });

  it("should format date correctly or return fallback for empty date", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    const formatted = formatDate("2024-02-26T02:34:26.000000Z");
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe("string");
  });

  it("should format short date or return fallback", () => {
    expect(formatShortDate(null)).toBe("-");
    expect(formatShortDate("2024-02-28T07:49:32.000000Z")).toContain("2024");
  });

  it("should format date time for API parameters", () => {
    expect(toApiDateTime(new Date(2024, 9, 5, 22, 0, 7))).toBe("2024-10-05 22:00:07");
    expect(toApiDateTime()).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it("should resolve image url from relative path or keep absolute url", () => {
    expect(toImageUrl(null)).toBeNull();
    expect(toImageUrl("https://cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
    expect(toImageUrl("blob:http://localhost/abc")).toBe("blob:http://localhost/abc");
    expect(toImageUrl("img/lost-founds/cover/1.png")).toBe(
      "https://open-api.delcom.org/img/lost-founds/cover/1.png"
    );
    expect(toImageUrl("/img/x.png")).toBe("https://open-api.delcom.org/img/x.png");
  });

  it("should resolve default avatar path outside /img to the Delcom server", () => {
    expect(toImageUrl("default/img/user.png")).toBe(
      "https://open-api.delcom.org/default/img/user.png"
    );
    expect(toImageUrl("/default/img/user.png")).toBe(
      "https://open-api.delcom.org/default/img/user.png"
    );
  });

  describe("toOptimizedImageUrl", () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("should return null without path and original url outside production", () => {
      expect(toOptimizedImageUrl(null)).toBeNull();
      expect(toOptimizedImageUrl("img/lost-founds/cover/1.png")).toBe(
        "https://open-api.delcom.org/img/lost-founds/cover/1.png"
      );
    });

    it("should build optimizer url from relative and absolute Delcom paths in production", () => {
      vi.stubEnv("PROD", true);
      const encoded = encodeURIComponent("https://open-api.delcom.org/img/lost-founds/cover/1.png");

      expect(toOptimizedImageUrl("img/lost-founds/cover/1.png")).toBe(
        `/_vercel/image?url=${encoded}&w=828&q=75`
      );
      expect(toOptimizedImageUrl("/img/lost-founds/cover/1.png", 640)).toBe(
        `/_vercel/image?url=${encoded}&w=640&q=75`
      );
      expect(toOptimizedImageUrl("https://open-api.delcom.org/img/lost-founds/cover/1.png", 96)).toBe(
        `/_vercel/image?url=${encoded}&w=96&q=75`
      );
    });

    it("should keep original url for images outside the Delcom server in production", () => {
      vi.stubEnv("PROD", true);
      expect(toOptimizedImageUrl("https://cdn.example.com/a.png")).toBe(
        "https://cdn.example.com/a.png"
      );
      expect(toOptimizedImageUrl("blob:http://localhost/abc")).toBe("blob:http://localhost/abc");
    });
  });
});
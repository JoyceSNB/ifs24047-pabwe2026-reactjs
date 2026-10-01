import { describe, it, expect, vi, beforeEach } from "vitest";
import lostFoundApi from "./lostFoundApi";
import apiHelper from "../../../helpers/apiHelper";

const BASE = "https://open-api.delcom.org/api/v1/lost-founds";

function mockResponse(body) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
    json: () => Promise.resolve(body),
  });
}

describe("lostFoundApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("postLostFound", () => {
    it("should send title, description and status then return data", async () => {
      const spy = mockResponse({ status: "success", data: { lost_found_id: 5 } });

      const data = await lostFoundApi.postLostFound("Dompet", "Dompet coklat", "lost");

      expect(data).toEqual({ lost_found_id: 5 });
      expect(spy).toHaveBeenCalledWith(`${BASE}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Dompet", description: "Dompet coklat", status: "lost" }),
      });
    });

    it("should throw server message on failure", async () => {
      mockResponse({ status: "fail", message: "Data tidak valid" });
      await expect(lostFoundApi.postLostFound("a", "b", "lost")).rejects.toThrow(
        "Data tidak valid"
      );
    });

    it("should throw fallback message when server message is empty", async () => {
      mockResponse({ status: "fail" });
      await expect(lostFoundApi.postLostFound("a", "b", "lost")).rejects.toThrow(
        "Gagal menambahkan laporan"
      );
    });

    it("should accept legacy success flag", async () => {
      mockResponse({ success: true, data: { lost_found_id: 1 } });
      await expect(lostFoundApi.postLostFound("a", "b", "found")).resolves.toEqual({
        lost_found_id: 1,
      });
    });
  });

  describe("postLostFoundCover", () => {
    it("should upload cover as form data", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil mengubah cover" });
      const file = new File(["img"], "foto.png", { type: "image/png" });

      const message = await lostFoundApi.postLostFoundCover(3, file);

      expect(message).toBe("Berhasil mengubah cover");
      const [url, options] = spy.mock.calls[0];
      expect(url).toBe(`${BASE}/3/cover`);
      expect(options.method).toBe("POST");
      expect(options.body.get("cover").name).toBe("foto.png");
    });

    it("should use default file name when blob has no name", async () => {
      const spy = mockResponse({ status: "success", message: "ok" });
      const blob = new Blob(["img"], { type: "image/jpeg" });

      await lostFoundApi.postLostFoundCover(3, blob);

      expect(spy.mock.calls[0][1].body.get("cover").name).toBe("cover.jpg");
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail" });
      const file = new File(["img"], "foto.png", { type: "image/png" });
      await expect(lostFoundApi.postLostFoundCover(3, file)).rejects.toThrow(
        "Gagal mengubah cover"
      );
    });
  });

  describe("putLostFound", () => {
    it("should send is_completed as 1 when true", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil mengubah data" });

      const message = await lostFoundApi.putLostFound(7, "Judul", "Deskripsi", "found", true);

      expect(message).toBe("Berhasil mengubah data");
      expect(spy).toHaveBeenCalledWith(`${BASE}/7`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Judul",
          description: "Deskripsi",
          status: "found",
          is_completed: 1,
        }),
      });
    });

    it("should send is_completed as 0 when false", async () => {
      const spy = mockResponse({ status: "success", message: "ok" });
      await lostFoundApi.putLostFound(7, "J", "D", "lost", 0);
      expect(JSON.parse(spy.mock.calls[0][1].body).is_completed).toBe(0);
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail" });
      await expect(lostFoundApi.putLostFound(7, "J", "D", "lost", 0)).rejects.toThrow(
        "Gagal mengubah laporan"
      );
    });
  });

  describe("getLostFounds", () => {
    it("should fetch without query when no filters", async () => {
      const spy = mockResponse({ status: "success", data: { lost_founds: [{ id: 1 }] } });

      const list = await lostFoundApi.getLostFounds();

      expect(list).toEqual([{ id: 1 }]);
      expect(spy).toHaveBeenCalledWith(`${BASE}/`, { method: "GET" });
    });

    it("should pass status, is_completed and is_me filters", async () => {
      const spy = mockResponse({ status: "success", data: { lost_founds: [] } });

      await lostFoundApi.getLostFounds({ status: "lost", is_completed: 0, is_me: 1 });

      expect(spy).toHaveBeenCalledWith(`${BASE}/?status=lost&is_completed=0&is_me=1`, {
        method: "GET",
      });
    });

    it("should return empty array when data is missing", async () => {
      mockResponse({ status: "success" });
      await expect(lostFoundApi.getLostFounds()).resolves.toEqual([]);
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail", message: "Unauthenticated." });
      await expect(lostFoundApi.getLostFounds()).rejects.toThrow("Unauthenticated.");
    });
  });

  describe("getLostFoundById", () => {
    it("should return lost_found detail", async () => {
      const spy = mockResponse({ status: "success", data: { lost_found: { id: 9 } } });

      await expect(lostFoundApi.getLostFoundById(9)).resolves.toEqual({ id: 9 });
      expect(spy).toHaveBeenCalledWith(`${BASE}/9`, { method: "GET" });
    });

    it("should return undefined when data is missing", async () => {
      mockResponse({ status: "success" });
      await expect(lostFoundApi.getLostFoundById(9)).resolves.toBeUndefined();
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail" });
      await expect(lostFoundApi.getLostFoundById(9)).rejects.toThrow(
        "Gagal mengambil detail laporan"
      );
    });
  });

  describe("deleteLostFound", () => {
    it("should delete and return message", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil menghapus data" });

      await expect(lostFoundApi.deleteLostFound(2)).resolves.toBe("Berhasil menghapus data");
      expect(spy).toHaveBeenCalledWith(`${BASE}/2`, { method: "DELETE" });
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail" });
      await expect(lostFoundApi.deleteLostFound(2)).rejects.toThrow("Gagal menghapus laporan");
    });
  });

  describe("stats", () => {
    it("should fetch daily stats with end_date and total_data", async () => {
      const spy = mockResponse({ status: "success", data: { stats_losts: { "01-10-2024": 1 } } });

      const data = await lostFoundApi.getStatsDaily({
        end_date: "2024-10-05 22:00:00",
        total_data: 7,
      });

      expect(data).toEqual({ stats_losts: { "01-10-2024": 1 } });
      expect(spy).toHaveBeenCalledWith(
        `${BASE}/stats/daily?end_date=2024-10-05+22%3A00%3A00&total_data=7`,
        { method: "GET" }
      );
    });

    it("should fetch monthly stats without params", async () => {
      const spy = mockResponse({ status: "success" });

      await expect(lostFoundApi.getStatsMonthly()).resolves.toEqual({});
      expect(spy).toHaveBeenCalledWith(`${BASE}/stats/monthly`, { method: "GET" });
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail" });
      await expect(lostFoundApi.getStatsDaily()).rejects.toThrow("Gagal mengambil statistik");
    });
  });
});

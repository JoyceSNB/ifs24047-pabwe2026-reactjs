import { describe, it, expect, vi, beforeEach } from "vitest";
import * as action from "./action";
import lostFoundApi from "../api/lostFoundApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

const { ActionType } = action;

describe("lost-founds action", () => {
  let dispatch;

  beforeEach(() => {
    vi.restoreAllMocks();
    dispatch = vi.fn();
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({});
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({});
  });

  it("should create plain action objects", () => {
    const creators = [
      [action.setLostFoundsActionCreator, ActionType.SET_LOST_FOUNDS, [{ id: 1 }]],
      [action.setLostFoundActionCreator, ActionType.SET_LOST_FOUND, { id: 1 }],
      [action.setIsLostFoundActionCreator, ActionType.SET_IS_LOST_FOUND, true],
      [action.setIsLostFoundAddActionCreator, ActionType.SET_IS_LOST_FOUND_ADD, true],
      [action.setIsLostFoundAddedActionCreator, ActionType.SET_IS_LOST_FOUND_ADDED, true],
      [action.setIsLostFoundChangeActionCreator, ActionType.SET_IS_LOST_FOUND_CHANGE, true],
      [action.setIsLostFoundChangedActionCreator, ActionType.SET_IS_LOST_FOUND_CHANGED, true],
      [
        action.setIsLostFoundChangeCoverActionCreator,
        ActionType.SET_IS_LOST_FOUND_CHANGE_COVER,
        true,
      ],
      [
        action.setIsLostFoundChangedCoverActionCreator,
        ActionType.SET_IS_LOST_FOUND_CHANGED_COVER,
        true,
      ],
      [action.setIsLostFoundDeleteActionCreator, ActionType.SET_IS_LOST_FOUND_DELETE, true],
      [action.setIsLostFoundDeletedActionCreator, ActionType.SET_IS_LOST_FOUND_DELETED, true],
      [action.setLostFoundStatsActionCreator, ActionType.SET_LOST_FOUND_STATS, { period: "daily" }],
    ];

    creators.forEach(([creator, type, payload]) => {
      expect(creator(payload)).toEqual({ type, payload });
    });
  });

  describe("asyncSetLostFounds", () => {
    it("should pass filters and dispatch list on success", async () => {
      const spy = vi.spyOn(lostFoundApi, "getLostFounds").mockResolvedValue([{ id: 1 }]);

      await action.asyncSetLostFounds({ is_me: 1 })(dispatch);

      expect(spy).toHaveBeenCalledWith({ is_me: 1 });
      expect(dispatch).toHaveBeenCalledWith(action.setLostFoundsActionCreator([{ id: 1 }]));
    });

    it("should use empty filters by default and dispatch [] on error", async () => {
      const spy = vi.spyOn(lostFoundApi, "getLostFounds").mockRejectedValue(new Error("x"));

      await action.asyncSetLostFounds()(dispatch);

      expect(spy).toHaveBeenCalledWith({});
      expect(dispatch).toHaveBeenCalledWith(action.setLostFoundsActionCreator([]));
    });
  });

  describe("asyncSetLostFound", () => {
    it("should dispatch detail and finished flag", async () => {
      vi.spyOn(lostFoundApi, "getLostFoundById").mockResolvedValue({ id: 3 });

      await action.asyncSetLostFound(3)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(action.setLostFoundActionCreator({ id: 3 }));
      expect(dispatch).toHaveBeenCalledWith(action.setIsLostFoundActionCreator(true));
    });

    it("should dispatch null on error", async () => {
      vi.spyOn(lostFoundApi, "getLostFoundById").mockRejectedValue(new Error("x"));

      await action.asyncSetLostFound(3)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(action.setLostFoundActionCreator(null));
      expect(dispatch).toHaveBeenCalledWith(action.setIsLostFoundActionCreator(true));
    });
  });

  describe("asyncSetIsLostFoundAdd", () => {
    it("should add report and flag success", async () => {
      const spy = vi.spyOn(lostFoundApi, "postLostFound").mockResolvedValue({ lost_found_id: 1 });

      await action.asyncSetIsLostFoundAdd("Dompet", "Coklat", "lost")(dispatch);

      expect(spy).toHaveBeenCalledWith("Dompet", "Coklat", "lost");
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(action.setIsLostFoundAddedActionCreator(true));
      expect(dispatch).toHaveBeenCalledWith(action.setIsLostFoundAddActionCreator(true));
    });

    it("should show error and flag failure", async () => {
      vi.spyOn(lostFoundApi, "postLostFound").mockRejectedValue(new Error("Gagal"));

      await action.asyncSetIsLostFoundAdd("a", "b", "found")(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal");
      expect(dispatch).toHaveBeenCalledWith(action.setIsLostFoundAddedActionCreator(false));
      expect(dispatch).toHaveBeenCalledWith(action.setIsLostFoundAddActionCreator(true));
    });
  });

  describe("asyncSetIsLostFoundChange", () => {
    it("should update report with server message", async () => {
      const spy = vi.spyOn(lostFoundApi, "putLostFound").mockResolvedValue("Berhasil mengubah");

      await action.asyncSetIsLostFoundChange(1, "J", "D", "found", 1)(dispatch);

      expect(spy).toHaveBeenCalledWith(1, "J", "D", "found", 1);
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Berhasil mengubah");
      expect(dispatch).toHaveBeenCalledWith(action.setIsLostFoundChangedActionCreator(true));
      expect(dispatch).toHaveBeenCalledWith(action.setIsLostFoundChangeActionCreator(true));
    });

    it("should fall back to default success message", async () => {
      vi.spyOn(lostFoundApi, "putLostFound").mockResolvedValue(undefined);

      await action.asyncSetIsLostFoundChange(1, "J", "D", "lost", 0)(dispatch);

      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Laporan berhasil diperbarui.");
    });

    it("should flag failure on error", async () => {
      vi.spyOn(lostFoundApi, "putLostFound").mockRejectedValue(new Error("Gagal ubah"));

      await action.asyncSetIsLostFoundChange(1, "J", "D", "lost", 0)(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal ubah");
      expect(dispatch).toHaveBeenCalledWith(action.setIsLostFoundChangedActionCreator(false));
    });
  });

  describe("asyncSetIsLostFoundChangeCover", () => {
    it("should upload cover with server message", async () => {
      const spy = vi.spyOn(lostFoundApi, "postLostFoundCover").mockResolvedValue("Cover oke");

      await action.asyncSetIsLostFoundChangeCover(1, "file")(dispatch);

      expect(spy).toHaveBeenCalledWith(1, "file");
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Cover oke");
      expect(dispatch).toHaveBeenCalledWith(action.setIsLostFoundChangedCoverActionCreator(true));
      expect(dispatch).toHaveBeenCalledWith(action.setIsLostFoundChangeCoverActionCreator(true));
    });

    it("should fall back to default message", async () => {
      vi.spyOn(lostFoundApi, "postLostFoundCover").mockResolvedValue("");

      await action.asyncSetIsLostFoundChangeCover(1, "file")(dispatch);

      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Foto berhasil diperbarui.");
    });

    it("should flag failure on error", async () => {
      vi.spyOn(lostFoundApi, "postLostFoundCover").mockRejectedValue(new Error("Besar"));

      await action.asyncSetIsLostFoundChangeCover(1, "file")(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Besar");
      expect(dispatch).toHaveBeenCalledWith(action.setIsLostFoundChangedCoverActionCreator(false));
    });
  });

  describe("asyncSetIsLostFoundDelete", () => {
    it("should delete with server message", async () => {
      const spy = vi.spyOn(lostFoundApi, "deleteLostFound").mockResolvedValue("Terhapus");

      await action.asyncSetIsLostFoundDelete(4)(dispatch);

      expect(spy).toHaveBeenCalledWith(4);
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Terhapus");
      expect(dispatch).toHaveBeenCalledWith(action.setIsLostFoundDeletedActionCreator(true));
      expect(dispatch).toHaveBeenCalledWith(action.setIsLostFoundDeleteActionCreator(true));
    });

    it("should fall back to default message", async () => {
      vi.spyOn(lostFoundApi, "deleteLostFound").mockResolvedValue(null);

      await action.asyncSetIsLostFoundDelete(4)(dispatch);

      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Laporan berhasil dihapus.");
    });

    it("should flag failure on error", async () => {
      vi.spyOn(lostFoundApi, "deleteLostFound").mockRejectedValue(new Error("Tidak boleh"));

      await action.asyncSetIsLostFoundDelete(4)(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Tidak boleh");
      expect(dispatch).toHaveBeenCalledWith(action.setIsLostFoundDeletedActionCreator(false));
    });
  });

  describe("asyncSetLostFoundStats", () => {
    it("should fetch daily stats by default", async () => {
      const spy = vi.spyOn(lostFoundApi, "getStatsDaily").mockResolvedValue({ stats_losts: {} });

      await action.asyncSetLostFoundStats()(dispatch);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ total_data: action.STATS_TOTAL_DATA.daily })
      );
      expect(dispatch).toHaveBeenCalledWith(
        action.setLostFoundStatsActionCreator({ period: "daily", data: { stats_losts: {} } })
      );
    });

    it("should fetch monthly stats", async () => {
      const spy = vi.spyOn(lostFoundApi, "getStatsMonthly").mockResolvedValue({ a: 1 });

      await action.asyncSetLostFoundStats("monthly")(dispatch);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ total_data: action.STATS_TOTAL_DATA.monthly })
      );
      expect(dispatch).toHaveBeenCalledWith(
        action.setLostFoundStatsActionCreator({ period: "monthly", data: { a: 1 } })
      );
    });

    it("should dispatch null on error", async () => {
      vi.spyOn(lostFoundApi, "getStatsDaily").mockRejectedValue(new Error("x"));

      await action.asyncSetLostFoundStats("daily")(dispatch);

      expect(dispatch).toHaveBeenCalledWith(action.setLostFoundStatsActionCreator(null));
    });
  });
});

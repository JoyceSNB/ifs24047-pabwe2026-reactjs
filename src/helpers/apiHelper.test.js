import { describe, it, expect, beforeEach, vi } from "vitest";
import apiHelper from "./apiHelper";

describe("apiHelper", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("should get and set access token correctly", () => {
    expect(apiHelper.getAccessToken()).toBeNull();
    apiHelper.putAccessToken("dummy-token");
    expect(apiHelper.getAccessToken()).toBe("dummy-token");
    apiHelper.putAccessToken("");
    expect(apiHelper.getAccessToken()).toBeNull();
  });

  it("should fetch data without query and append Authorization header when token exists", async () => {
    apiHelper.putAccessToken("test-token");
    const mockFetch = vi.fn().mockResolvedValue({ status: 200 });
    global.fetch = mockFetch;

    await apiHelper.fetchData("http://localhost:8765/api/v1/users/", {
      method: "GET",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8765/api/v1/users",
      expect.objectContaining({
        method: "GET",
        headers: {
          Authorization: "Bearer test-token",
        },
      })
    );
  });

  it("should handle url with query parameters and without trailing slash correctly", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ status: 200 });
    global.fetch = mockFetch;

    await apiHelper.fetchData("http://localhost:8765/api/v1/todos?is_finished=1", {
      method: "GET",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8765/api/v1/todos?is_finished=1",
      expect.objectContaining({
        method: "GET",
        headers: {},
      })
    );
  });

  it("should build query string and skip empty values", () => {
    expect(apiHelper.buildQuery()).toBe("");
    expect(apiHelper.buildQuery({ status: "", is_me: null, x: undefined })).toBe("");
    expect(apiHelper.buildQuery({ status: "lost", is_completed: 0, is_me: 1 })).toBe(
      "?status=lost&is_completed=0&is_me=1"
    );
    expect(apiHelper.buildQuery({ end_date: "2024-10-05 22:00:00" })).toBe(
      "?end_date=2024-10-05+22%3A00%3A00"
    );
  });
});

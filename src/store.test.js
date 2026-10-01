import { describe, it, expect } from "vitest";
import store, { reducers } from "./store";

describe("store", () => {
  it("should combine reducers from auth, users and lost-founds", () => {
    const state = store.getState();

    Object.keys(reducers).forEach((key) => {
      expect(state).toHaveProperty(key);
    });

    expect(state.isAuthLogin).toBe(false);
    expect(state.profile).toBeNull();
    expect(state.lostFounds).toEqual([]);
    expect(state.lostFound).toBeNull();
    expect(state.lostFoundStats).toBeNull();
    expect(state.isLostFoundDeleted).toBe(false);
  });
});

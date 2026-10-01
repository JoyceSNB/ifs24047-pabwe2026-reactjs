import { describe, it, expect } from "vitest";
import { ActionType } from "./action";
import {
  lostFoundsReducer,
  lostFoundReducer,
  isLostFoundReducer,
  isLostFoundAddReducer,
  isLostFoundAddedReducer,
  isLostFoundChangeReducer,
  isLostFoundChangedReducer,
  isLostFoundChangeCoverReducer,
  isLostFoundChangedCoverReducer,
  isLostFoundDeleteReducer,
  isLostFoundDeletedReducer,
  lostFoundStatsReducer,
} from "./reducer";

const cases = [
  ["lostFoundsReducer", lostFoundsReducer, ActionType.SET_LOST_FOUNDS, [], [{ id: 1 }]],
  ["lostFoundReducer", lostFoundReducer, ActionType.SET_LOST_FOUND, null, { id: 1 }],
  ["isLostFoundReducer", isLostFoundReducer, ActionType.SET_IS_LOST_FOUND, false, true],
  ["isLostFoundAddReducer", isLostFoundAddReducer, ActionType.SET_IS_LOST_FOUND_ADD, false, true],
  [
    "isLostFoundAddedReducer",
    isLostFoundAddedReducer,
    ActionType.SET_IS_LOST_FOUND_ADDED,
    false,
    true,
  ],
  [
    "isLostFoundChangeReducer",
    isLostFoundChangeReducer,
    ActionType.SET_IS_LOST_FOUND_CHANGE,
    false,
    true,
  ],
  [
    "isLostFoundChangedReducer",
    isLostFoundChangedReducer,
    ActionType.SET_IS_LOST_FOUND_CHANGED,
    false,
    true,
  ],
  [
    "isLostFoundChangeCoverReducer",
    isLostFoundChangeCoverReducer,
    ActionType.SET_IS_LOST_FOUND_CHANGE_COVER,
    false,
    true,
  ],
  [
    "isLostFoundChangedCoverReducer",
    isLostFoundChangedCoverReducer,
    ActionType.SET_IS_LOST_FOUND_CHANGED_COVER,
    false,
    true,
  ],
  [
    "isLostFoundDeleteReducer",
    isLostFoundDeleteReducer,
    ActionType.SET_IS_LOST_FOUND_DELETE,
    false,
    true,
  ],
  [
    "isLostFoundDeletedReducer",
    isLostFoundDeletedReducer,
    ActionType.SET_IS_LOST_FOUND_DELETED,
    false,
    true,
  ],
  [
    "lostFoundStatsReducer",
    lostFoundStatsReducer,
    ActionType.SET_LOST_FOUND_STATS,
    null,
    { period: "daily", data: {} },
  ],
];

describe("lost-founds reducer", () => {
  it.each(cases)("%s should return initial state", (_name, reducer, _type, initial) => {
    expect(reducer(undefined, { type: "UNKNOWN" })).toEqual(initial);
    expect(reducer(undefined)).toEqual(initial);
  });

  it.each(cases)("%s should handle its action type", (_name, reducer, type, initial, payload) => {
    expect(reducer(initial, { type, payload })).toEqual(payload);
  });

  it.each(cases)("%s should ignore other actions", (_name, reducer, _type, _initial, payload) => {
    expect(reducer(payload, { type: "OTHER", payload: "x" })).toEqual(payload);
  });
});

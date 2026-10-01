import { ActionType } from "./action";

function createReducer(type, initialState) {
  return function reducer(state = initialState, action = {}) {
    switch (action.type) {
      case type:
        return action.payload;
      default:
        return state;
    }
  };
}

export const lostFoundsReducer = createReducer(ActionType.SET_LOST_FOUNDS, []);
export const lostFoundReducer = createReducer(ActionType.SET_LOST_FOUND, null);
export const isLostFoundReducer = createReducer(ActionType.SET_IS_LOST_FOUND, false);

export const isLostFoundAddReducer = createReducer(ActionType.SET_IS_LOST_FOUND_ADD, false);
export const isLostFoundAddedReducer = createReducer(ActionType.SET_IS_LOST_FOUND_ADDED, false);

export const isLostFoundChangeReducer = createReducer(ActionType.SET_IS_LOST_FOUND_CHANGE, false);
export const isLostFoundChangedReducer = createReducer(
  ActionType.SET_IS_LOST_FOUND_CHANGED,
  false
);

export const isLostFoundChangeCoverReducer = createReducer(
  ActionType.SET_IS_LOST_FOUND_CHANGE_COVER,
  false
);
export const isLostFoundChangedCoverReducer = createReducer(
  ActionType.SET_IS_LOST_FOUND_CHANGED_COVER,
  false
);

export const isLostFoundDeleteReducer = createReducer(ActionType.SET_IS_LOST_FOUND_DELETE, false);
export const isLostFoundDeletedReducer = createReducer(
  ActionType.SET_IS_LOST_FOUND_DELETED,
  false
);

export const lostFoundStatsReducer = createReducer(ActionType.SET_LOST_FOUND_STATS, null);

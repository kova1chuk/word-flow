import { RootState } from "@/shared/model/store";

// Base selectors
export const selectUserStats = (state: RootState) => state.userStats;

// Derived selectors
export const selectWordStats = (state: RootState) => state.userStats.wordStats;
export const selectUserStatsLoading = (state: RootState) =>
  state.userStats.loading;
export const selectUserStatsError = (state: RootState) => state.userStats.error;

// Computed selectors
export const selectTotalWords = (state: RootState) => {
  const wordStats = state.userStats.wordStats;
  if (!wordStats) return 0;
  return Object.values(wordStats).reduce((sum, count) => sum + count, 0);
};

export const selectWordsByStatus = (state: RootState, status: number) => {
  const wordStats = state.userStats.wordStats;
  return wordStats?.[status] || 0;
};

export const selectHasUserStats = (state: RootState) => {
  return state.userStats.wordStats !== null;
};

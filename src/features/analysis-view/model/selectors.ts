import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/shared/model/store";

// Base selectors
export const selectTrainingStatsState = (state: RootState) =>
  state.trainingStats;

export const selectTrainingStats = createSelector(
  [selectTrainingStatsState],
  (trainingStatsState) => trainingStatsState.stats
);

export const selectTrainingStatsLoading = createSelector(
  [selectTrainingStatsState],
  (trainingStatsState) => trainingStatsState.loading
);

export const selectTrainingStatsError = createSelector(
  [selectTrainingStatsState],
  (trainingStatsState) => trainingStatsState.error
);

// Derived selectors
export const selectHasTrainingData = createSelector(
  [selectTrainingStats],
  (stats) => stats !== null && stats.total > 0
);

export const selectTrainingProgress = createSelector(
  [selectTrainingStats],
  (stats) => {
    if (!stats || stats.total === 0) return 0;
    return (stats.learned / stats.total) * 100;
  }
);

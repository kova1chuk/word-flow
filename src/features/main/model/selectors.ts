import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "@/shared/model/store";

export const selectMainChartData = createSelector(
  (state: RootState) => state.main.totalWords,
  (state: RootState) => state.main.wordStats,
  (totalWords, wordStats) => ({ totalWords, wordStats }),
);

export const selectMainChartDataLoading = (state: RootState) =>
  state.main.loading;

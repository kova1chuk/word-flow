import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "@/shared/model/store";

// Base selectors - Use direct selectors for simple property access
export const selectAnalyses = (state: RootState) => state.analyses.analyses;

export const selectAnalysesLoading = (state: RootState) =>
  state.analyses.loading;

export const selectAnalysesError = (state: RootState) => state.analyses.error;

// Derived selectors that need memoization
export const selectAnalysesCount = createSelector(
  [selectAnalyses],
  (analyses) => analyses.length,
);

export const selectLatestAnalysis = createSelector(
  [selectAnalyses],
  (analyses) => analyses[0] || null,
);

import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/shared/model/store";

// Base selectors
export const selectAnalysesState = (state: RootState) => state.analyses;

export const selectAnalyses = createSelector(
  [selectAnalysesState],
  (analysesState) => analysesState.analyses
);

export const selectAnalysesLoading = createSelector(
  [selectAnalysesState],
  (analysesState) => analysesState.loading
);

export const selectAnalysesError = createSelector(
  [selectAnalysesState],
  (analysesState) => analysesState.error
);

// Derived selectors
export const selectAnalysesCount = createSelector(
  [selectAnalyses],
  (analyses) => analyses.length
);

export const selectLatestAnalysis = createSelector(
  [selectAnalyses],
  (analyses) => analyses[0] || null
);

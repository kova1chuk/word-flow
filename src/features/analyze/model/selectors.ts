import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "@/shared/model/store";

// Base selectors - Use direct selectors for simple property access
export const selectAnalyzeText = () => ""; // TODO: Add text property to AnalyzeState

export const selectAnalysisResult = (state: RootState) => state.analyze.result;

export const selectAnalyzeLoading = (state: RootState) => state.analyze.loading;

export const selectAnalyzeSaving = (state: RootState) => state.analyze.saving;

export const selectSavedAnalysisId = (state: RootState) =>
  state.analyze.savedAnalysisId;

export const selectAnalyzeError = (state: RootState) => state.analyze.error;

// Derived selectors that need memoization
export const selectHasAnalysisResult = createSelector(
  [selectAnalysisResult],
  (result) => result !== null,
);

export const selectAnalysisSummary = createSelector(
  [selectAnalysisResult],
  (result) => result?.summary || null,
);

export const selectUniqueWords = createSelector(
  [selectAnalysisResult],
  (result) => result?.unknownWordList || [],
);

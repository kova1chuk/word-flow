import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "@/shared/model/store";

// Base selectors
export const selectAnalyzeState = (state: RootState) => state.analyze;

export const selectAnalyzeText = createSelector(
  [selectAnalyzeState],
  () => "", // TODO: Add text property to AnalyzeState
);

export const selectAnalysisResult = createSelector(
  [selectAnalyzeState],
  (analyzeState) => analyzeState.result,
);

export const selectAnalyzeLoading = createSelector(
  [selectAnalyzeState],
  (analyzeState) => analyzeState.loading,
);

export const selectAnalyzeSaving = createSelector(
  [selectAnalyzeState],
  (analyzeState) => analyzeState.saving,
);

export const selectSavedAnalysisId = createSelector(
  [selectAnalyzeState],
  (analyzeState) => analyzeState.savedAnalysisId,
);

export const selectAnalyzeError = createSelector(
  [selectAnalyzeState],
  (analyzeState) => analyzeState.error,
);

// Derived selectors
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

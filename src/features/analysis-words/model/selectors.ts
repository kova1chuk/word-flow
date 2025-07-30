import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "@/shared/model/store";

// Base selectors - Use direct selectors for simple property access
export const selectAnalysisWords = (state: RootState) =>
  state.analysisWords.words;

export const selectAnalysisWordsLoading = (state: RootState) =>
  state.analysisWords.loading;

export const selectAnalysisWordsError = (state: RootState) =>
  state.analysisWords.error;

export const selectAnalysisWordsStats = (state: RootState) =>
  state.analysisWords.stats;

// Derived selectors that need memoization
export const selectLearnedWords = createSelector(
  [selectAnalysisWords],
  (words) => words.filter((word) => word.isLearned),
);

export const selectNotLearnedWords = createSelector(
  [selectAnalysisWords],
  (words) => words.filter((word) => !word.isLearned),
);

export const selectWordsInDictionary = createSelector(
  [selectAnalysisWords],
  (words) => words.filter((word) => word.isInDictionary),
);

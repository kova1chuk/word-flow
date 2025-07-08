import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/shared/model/store";

// Base selectors
export const selectAnalysisWordsState = (state: RootState) =>
  state.analysisWords;

export const selectAnalysisWords = createSelector(
  [selectAnalysisWordsState],
  (analysisWordsState) => analysisWordsState.words
);

export const selectAnalysisWordsLoading = createSelector(
  [selectAnalysisWordsState],
  (analysisWordsState) => analysisWordsState.loading
);

export const selectAnalysisWordsError = createSelector(
  [selectAnalysisWordsState],
  (analysisWordsState) => analysisWordsState.error
);

export const selectAnalysisWordsStats = createSelector(
  [selectAnalysisWordsState],
  (analysisWordsState) => analysisWordsState.stats
);

// Derived selectors
export const selectLearnedWords = createSelector(
  [selectAnalysisWords],
  (words) => words.filter((word) => word.isLearned)
);

export const selectNotLearnedWords = createSelector(
  [selectAnalysisWords],
  (words) => words.filter((word) => !word.isLearned)
);

export const selectWordsInDictionary = createSelector(
  [selectAnalysisWords],
  (words) => words.filter((word) => word.isInDictionary)
);

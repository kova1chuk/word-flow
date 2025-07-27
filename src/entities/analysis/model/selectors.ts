import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "@/shared/model/store";

// Analysis data selectors - Use direct selectors for simple property access
export const selectAnalysis = (state: RootState) => state.analysis.analysis;

export const selectSentences = (state: RootState) => state.analysis.sentences;

export const selectAnalysisLoading = (state: RootState) =>
  state.analysis.loading;

export const selectAnalysisError = (state: RootState) => state.analysis.error;

// Pagination selectors
export const selectSentencesLoading = (state: RootState) =>
  state.analysis.sentencesLoading;

export const selectHasMore = (state: RootState) => state.analysis.hasMore;

export const selectLastDoc = (state: RootState) => state.analysis.lastDoc;

// Training stats selectors
export const selectTrainingStats = (state: RootState) =>
  state.analysis.trainingStats;

export const selectTrainingLoading = (state: RootState) =>
  state.analysis.trainingLoading;

// Translation selectors
export const selectTranslatedSentences = (state: RootState) =>
  state.analysis.translatedSentences;

export const selectTranslatingSentenceId = (state: RootState) =>
  state.analysis.translatingSentenceId;

// Word info selectors
export const selectSelectedWord = (state: RootState) =>
  state.analysis.selectedWord;

export const selectWordInfoLoading = (state: RootState) =>
  state.analysis.wordInfoLoading;

export const selectReloadingDefinition = (state: RootState) =>
  state.analysis.reloadingDefinition;

export const selectReloadingTranslation = (state: RootState) =>
  state.analysis.reloadingTranslation;

// View state selectors
export const selectViewMode = (state: RootState) =>
  state.analysis.view.viewMode;

export const selectIsFullScreen = (state: RootState) =>
  state.analysis.view.isFullScreen;

export const selectCurrentPage = (state: RootState) =>
  state.analysis.view.currentPage;

export const selectSentencesPerPage = (state: RootState) =>
  state.analysis.view.sentencesPerPage;

export const selectShowSettings = (state: RootState) =>
  state.analysis.view.showSettings;

// Computed selectors that need memoization
export const selectTotalPages = createSelector(
  [selectSentences, selectSentencesPerPage],
  (sentences, sentencesPerPage) => {
    return Math.ceil(sentences.length / sentencesPerPage);
  },
);

export const selectStartIndex = createSelector(
  [selectCurrentPage, selectSentencesPerPage],
  (currentPage, sentencesPerPage) => {
    return (currentPage - 1) * sentencesPerPage;
  },
);

export const selectCurrentSentences = createSelector(
  [selectSentences, selectStartIndex, selectSentencesPerPage],
  (sentences, startIndex, sentencesPerPage) => {
    return sentences.slice(startIndex, startIndex + sentencesPerPage);
  },
);

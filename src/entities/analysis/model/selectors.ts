import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";

// Base selectors
const selectAnalysisState = (state: RootState) => state.analysis;

// Analysis data selectors
export const selectAnalysis = createSelector(
  [selectAnalysisState],
  (analysis) => analysis.analysis
);

export const selectSentences = createSelector(
  [selectAnalysisState],
  (analysis) => analysis.sentences
);

export const selectAnalysisLoading = createSelector(
  [selectAnalysisState],
  (analysis) => analysis.loading
);

export const selectAnalysisError = createSelector(
  [selectAnalysisState],
  (analysis) => analysis.error
);

// Translation selectors
export const selectTranslatedSentences = createSelector(
  [selectAnalysisState],
  (analysis) => analysis.translatedSentences
);

export const selectTranslatingSentenceId = createSelector(
  [selectAnalysisState],
  (analysis) => analysis.translatingSentenceId
);

// Word info selectors
export const selectSelectedWord = createSelector(
  [selectAnalysisState],
  (analysis) => analysis.selectedWord
);

export const selectWordInfoLoading = createSelector(
  [selectAnalysisState],
  (analysis) => analysis.wordInfoLoading
);

export const selectReloadingDefinition = createSelector(
  [selectAnalysisState],
  (analysis) => analysis.reloadingDefinition
);

export const selectReloadingTranslation = createSelector(
  [selectAnalysisState],
  (analysis) => analysis.reloadingTranslation
);

// View state selectors
export const selectViewMode = createSelector(
  [selectAnalysisState],
  (analysis) => analysis.view.viewMode
);

export const selectIsFullScreen = createSelector(
  [selectAnalysisState],
  (analysis) => analysis.view.isFullScreen
);

export const selectCurrentPage = createSelector(
  [selectAnalysisState],
  (analysis) => analysis.view.currentPage
);

export const selectSentencesPerPage = createSelector(
  [selectAnalysisState],
  (analysis) => analysis.view.sentencesPerPage
);

export const selectShowSettings = createSelector(
  [selectAnalysisState],
  (analysis) => analysis.view.showSettings
);

// Computed selectors
export const selectTotalPages = createSelector(
  [selectSentences, selectSentencesPerPage],
  (sentences, sentencesPerPage) =>
    Math.ceil(sentences.length / sentencesPerPage)
);

export const selectCurrentSentences = createSelector(
  [selectSentences, selectCurrentPage, selectSentencesPerPage],
  (sentences, currentPage, sentencesPerPage) => {
    const startIndex = (currentPage - 1) * sentencesPerPage;
    const endIndex = startIndex + sentencesPerPage;
    return sentences.slice(startIndex, endIndex);
  }
);

export const selectStartIndex = createSelector(
  [selectCurrentPage, selectSentencesPerPage],
  (currentPage, sentencesPerPage) => (currentPage - 1) * sentencesPerPage
);

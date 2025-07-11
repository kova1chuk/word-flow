import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "@/shared/model/store";

// Base selectors
export const selectTrainingState = (state: RootState) => state.training;

// Training mode and settings
export const selectTrainingMode = createSelector(
  [selectTrainingState],
  (training) => training.mode
);

export const selectSelectedStatuses = createSelector(
  [selectTrainingState],
  (training) => training.selectedStatuses
);

// Word training
export const selectTrainingWords = createSelector(
  [selectTrainingState],
  (training) => training.words
);

export const selectCurrentWordIndex = createSelector(
  [selectTrainingState],
  (training) => training.currentIndex
);

export const selectCurrentWord = createSelector(
  [selectTrainingWords, selectCurrentWordIndex],
  (words, index) => words[index] || null
);

export const selectTrainingStarted = createSelector(
  [selectTrainingState],
  (training) => training.isStarted
);

// Derived selectors
export const selectHasTrainingData = createSelector(
  [selectTrainingWords, selectTrainingMode],
  (words, mode) => {
    if (mode === "word") return words.length > 0;
    return false; // No sentence training implemented yet
  }
);

export const selectNextWord = createSelector(
  [selectTrainingWords, selectCurrentWordIndex],
  (words, index) => words[index + 1] || null
);

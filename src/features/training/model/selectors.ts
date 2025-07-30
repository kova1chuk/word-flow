import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "@/shared/model/store";

// Base selectors
export const selectTrainingState = (state: RootState) => state.training;

// Training mode and settings
export const selectTrainingMode = createSelector(
  [selectTrainingState],
  () => "word", // TODO: Add mode property to TrainingState
);

export const selectSelectedStatuses = createSelector(
  [selectTrainingState],
  () => [] as number[], // TODO: Add selectedStatuses property to TrainingState
);

// Word training
export const selectTrainingWords = createSelector(
  [selectTrainingState],
  (training) => training.currentSession?.questions.map((q) => q.word) || [],
);

export const selectCurrentWordIndex = createSelector(
  [selectTrainingState],
  (training) => training.currentQuestionIndex,
);

export const selectCurrentWord = createSelector(
  [selectTrainingWords, selectCurrentWordIndex],
  (words, index) => words[index] || null,
);

export const selectTrainingStarted = createSelector(
  [selectTrainingState],
  (training) => training.isSessionActive,
);

// Derived selectors
export const selectHasTrainingData = createSelector(
  [selectTrainingWords, selectTrainingMode],
  (words, mode) => {
    if (mode === "word") return words.length > 0;
    return false; // No sentence training implemented yet
  },
);

export const selectNextWord = createSelector(
  [selectTrainingWords, selectCurrentWordIndex],
  (words, index) => words[index + 1] || null,
);

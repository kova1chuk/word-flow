import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";

// Base selectors
export const selectTrainingState = (state: RootState) => state.training;

// Training mode and settings
export const selectTrainingMode = createSelector(
  [selectTrainingState],
  (training) => training.trainingMode
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
  (training) => training.currentWordIndex
);

export const selectCurrentWord = createSelector(
  [selectTrainingWords, selectCurrentWordIndex],
  (words, index) => words[index] || null
);

export const selectTrainingStarted = createSelector(
  [selectTrainingState],
  (training) => training.trainingStarted
);

export const selectTrainingCompleted = createSelector(
  [selectTrainingState],
  (training) => training.trainingCompleted
);

// Sentence training
export const selectTrainingSentences = createSelector(
  [selectTrainingState],
  (training) => training.sentences
);

export const selectCurrentSentenceIndex = createSelector(
  [selectTrainingState],
  (training) => training.currentSentenceIndex
);

export const selectCurrentSentence = createSelector(
  [selectTrainingSentences, selectCurrentSentenceIndex],
  (sentences, index) => sentences[index] || null
);

export const selectShuffledWords = createSelector(
  [selectTrainingState],
  (training) => training.shuffledWords
);

export const selectUserAnswer = createSelector(
  [selectTrainingState],
  (training) => training.userAnswer
);

export const selectIsAnswerChecked = createSelector(
  [selectTrainingState],
  (training) => training.isAnswerChecked
);

// Progress tracking
export const selectTotalWords = createSelector(
  [selectTrainingState],
  (training) => training.totalWords
);

export const selectCompletedWords = createSelector(
  [selectTrainingState],
  (training) => training.completedWords
);

export const selectCorrectAnswers = createSelector(
  [selectTrainingState],
  (training) => training.correctAnswers
);

export const selectIncorrectAnswers = createSelector(
  [selectTrainingState],
  (training) => training.incorrectAnswers
);

export const selectTrainingProgress = createSelector(
  [selectCompletedWords, selectTotalWords],
  (completed, total) => (total > 0 ? (completed / total) * 100 : 0)
);

export const selectAccuracy = createSelector(
  [selectCorrectAnswers, selectCompletedWords],
  (correct, completed) => (completed > 0 ? (correct / completed) * 100 : 0)
);

// Loading states
export const selectTrainingLoading = createSelector(
  [selectTrainingState],
  (training) => training.loading
);

export const selectTrainingUpdating = createSelector(
  [selectTrainingState],
  (training) => training.updating
);

export const selectTrainingError = createSelector(
  [selectTrainingState],
  (training) => training.error
);

// Derived selectors
export const selectHasTrainingData = createSelector(
  [selectTrainingWords, selectTrainingSentences, selectTrainingMode],
  (words, sentences, mode) => {
    if (mode === "word") return words.length > 0;
    return sentences.length > 0;
  }
);

export const selectIsTrainingActive = createSelector(
  [selectTrainingStarted, selectTrainingCompleted],
  (started, completed) => started && !completed
);

export const selectRemainingWords = createSelector(
  [selectTotalWords, selectCompletedWords],
  (total, completed) => total - completed
);

export const selectNextWord = createSelector(
  [selectTrainingWords, selectCurrentWordIndex],
  (words, index) => words[index + 1] || null
);

export const selectNextSentence = createSelector(
  [selectTrainingSentences, selectCurrentSentenceIndex],
  (sentences, index) => sentences[index + 1] || null
);

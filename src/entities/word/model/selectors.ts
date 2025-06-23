import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";
import { Word } from "../types";

// Base selectors
const selectWordState = (state: RootState) => state.word;

// Derived selectors
export const selectWords = createSelector(
  [selectWordState],
  (word) => word.words
);

export const selectSelectedWord = createSelector(
  [selectWordState],
  (word) => word.selectedWord
);

export const selectWordLoading = createSelector(
  [selectWordState],
  (word) => word.loading
);

export const selectWordError = createSelector(
  [selectWordState],
  (word) => word.error
);

// Filtered selectors
export const selectWordsByStatus = createSelector(
  [selectWords, (_, status: string) => status],
  (words: Word[], status: string) => {
    if (status === "all") return words;
    if (status === "unset") return words.filter((word: Word) => !word.status);
    return words.filter((word: Word) => word.status === status);
  }
);

export const selectWordById = createSelector(
  [selectWords, (_, id: string) => id],
  (words: Word[], id: string) => words.find((word: Word) => word.id === id)
);

export const selectWordsCount = createSelector(
  [selectWords],
  (words: Word[]) => words.length
);

export const selectWordsByStatusCount = createSelector(
  [selectWordsByStatus],
  (words: Word[]) => words.length
);

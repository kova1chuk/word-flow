import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/shared/model/store";
import type { Word } from "@/entities/word/types";

// Base selectors
export const selectAllWords = (state: RootState) => state.word.words;
export const selectWordLoading = (state: RootState) => state.word.loading;
export const selectWordError = (state: RootState) => state.word.error;

// Filtered word selectors
export const selectWordsByStatus = createSelector(
  [selectAllWords, (_state: RootState, status: number | "unset") => status],
  (words, status) => {
    if (status === "unset") return words.filter((word: Word) => !word.status);
    return words.filter((word: Word) => word.status === status);
  }
);

export const selectWordsByStatuses = createSelector(
  [selectAllWords, (_state: RootState, statuses: number[]) => statuses],
  (words, statuses) => {
    return words.filter(
      (word: Word) => word.status && statuses.includes(word.status)
    );
  }
);

export const selectLearnedWords = createSelector([selectAllWords], (words) =>
  words.filter((word: Word) => word.status && word.status >= 6)
);

export const selectNotLearnedWords = createSelector([selectAllWords], (words) =>
  words.filter((word: Word) => !word.status || word.status < 6)
);

export const selectWordsNeedingReview = createSelector(
  [selectAllWords],
  (words) =>
    words.filter(
      (word: Word) => word.status && word.status >= 1 && word.status <= 5
    )
);

// Word statistics selectors
export const selectWordStats = createSelector([selectAllWords], (words) => {
  const stats = {
    total: words.length,
    notLearned: 0,
    beginner: 0,
    basic: 0,
    intermediate: 0,
    advanced: 0,
    wellKnown: 0,
    mastered: 0,
    learned: 0,
  };

  words.forEach((word) => {
    const status = word.status;
    if (!status) {
      stats.notLearned++;
    } else {
      switch (status) {
        case 1:
          stats.notLearned++;
          break;
        case 2:
          stats.beginner++;
          break;
        case 3:
          stats.basic++;
          break;
        case 4:
          stats.intermediate++;
          break;
        case 5:
          stats.advanced++;
          break;
        case 6:
          stats.wellKnown++;
          stats.learned++;
          break;
        case 7:
          stats.mastered++;
          stats.learned++;
          break;
      }
    }
  });

  return stats;
});

// Search and filter selectors
export const selectWordsBySearch = createSelector(
  [selectAllWords, (_state: RootState, searchQuery: string) => searchQuery],
  (words, searchQuery) => {
    if (!searchQuery.trim()) return words;

    const query = searchQuery.toLowerCase();
    return words.filter(
      (word: Word) =>
        word.word.toLowerCase().includes(query) ||
        word.definition?.toLowerCase().includes(query) ||
        word.translation?.toLowerCase().includes(query)
    );
  }
);

export const selectWordsByAnalysis = createSelector(
  [selectAllWords, (_state: RootState, analysisId: string) => analysisId],
  (words, analysisId) => {
    return words.filter((word: Word) => word.analysisIds?.includes(analysisId));
  }
);

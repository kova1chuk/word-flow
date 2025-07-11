import { createSelector } from "@reduxjs/toolkit";

import type { Word } from "@/entities/word/types";

import type { RootState } from "@/shared/model/store";

// Basic selectors
export const selectWords = (state: RootState) => state.words.words;
export const selectWordsLoading = (state: RootState) => state.words.loading;
export const selectWordsError = (state: RootState) => state.words.error;
export const selectWordsUpdating = (state: RootState) => state.words.updating;

// Helper function to get all words from all pages
const getAllWords = (wordsByPage: Record<number, Word[]>): Word[] => {
  return Object.values(wordsByPage).flat();
};

// Memoized selectors
export const selectWordsByStatus = createSelector(
  [selectWords, (_state: RootState, status: number) => status],
  (wordsByPage, status) =>
    getAllWords(wordsByPage).filter((word) => word.status === status)
);

export const selectWordsByStatuses = createSelector(
  [selectWords, (_state: RootState, statuses: number[]) => statuses],
  (wordsByPage, statuses) =>
    getAllWords(wordsByPage).filter(
      (word) => word.status && statuses.includes(word.status)
    )
);

export const selectWordsBySearch = createSelector(
  [selectWords, (_state: RootState, searchTerm: string) => searchTerm],
  (wordsByPage, searchTerm) => {
    if (!searchTerm.trim()) return getAllWords(wordsByPage);
    const term = searchTerm.toLowerCase();
    return getAllWords(wordsByPage).filter((word) =>
      word.word.toLowerCase().includes(term)
    );
  }
);

export const selectFilteredWords = createSelector(
  [
    selectWords,
    (_state: RootState, filters: { statuses?: number[]; search?: string }) =>
      filters,
  ],
  (wordsByPage, { statuses, search }) => {
    let filtered = getAllWords(wordsByPage);

    // Filter by statuses
    if (statuses && statuses.length > 0) {
      filtered = filtered.filter(
        (word) => word.status && statuses.includes(word.status)
      );
    }

    // Filter by search
    if (search && search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter((word) =>
        word.word.toLowerCase().includes(term)
      );
    }

    return filtered;
  }
);

export const selectWordsStats = createSelector([selectWords], (wordsByPage) => {
  const words = getAllWords(wordsByPage);
  const stats = {
    total: words.length,
    byStatus: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
    },
    unset: 0,
  };

  words.forEach((word) => {
    if (word.status && word.status >= 1 && word.status <= 7) {
      stats.byStatus[word.status as keyof typeof stats.byStatus]++;
    } else {
      stats.unset++;
    }
  });

  return stats;
});

export const selectWordById = createSelector(
  [selectWords, (_state: RootState, wordId: string) => wordId],
  (wordsByPage, wordId) =>
    getAllWords(wordsByPage).find((word) => word.id === wordId)
);

export const selectPaginatedWords = createSelector(
  [
    selectWords,
    (state: RootState) => state.words.pagination,
    (
      _state: RootState,
      options: {
        page: number;
        pageSize: number;
      }
    ) => options,
  ],
  (wordsByPage, pagination, { page, pageSize }) => {
    // Get words for the current page
    const pageWords = wordsByPage[page] || [];

    return {
      words: pageWords,
      total: pagination.totalWords || 0,
      totalPages:
        pagination.totalWords !== undefined && pagination.totalWords > 0
          ? Math.ceil(pagination.totalWords / pageSize)
          : undefined, // undefined when we don't know total count (search mode)
      currentPage: page,
      hasNextPage: pagination.hasMore,
      hasPrevPage: page > 1,
    };
  }
);

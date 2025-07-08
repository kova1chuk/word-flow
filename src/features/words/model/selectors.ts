import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/shared/model/store";

// Basic selectors
export const selectWords = (state: RootState) => state.words.words;
export const selectWordsLoading = (state: RootState) => state.words.loading;
export const selectWordsError = (state: RootState) => state.words.error;
export const selectWordsUpdating = (state: RootState) => state.words.updating;

// Memoized selectors
export const selectWordsByStatus = createSelector(
  [selectWords, (_state: RootState, status: number) => status],
  (words, status) => words.filter((word) => word.status === status)
);

export const selectWordsByStatuses = createSelector(
  [selectWords, (_state: RootState, statuses: number[]) => statuses],
  (words, statuses) =>
    words.filter((word) => word.status && statuses.includes(word.status))
);

export const selectWordsBySearch = createSelector(
  [selectWords, (_state: RootState, searchTerm: string) => searchTerm],
  (words, searchTerm) => {
    if (!searchTerm.trim()) return words;
    const term = searchTerm.toLowerCase();
    return words.filter((word) => word.word.toLowerCase().includes(term));
  }
);

export const selectFilteredWords = createSelector(
  [
    selectWords,
    (_state: RootState, filters: { statuses?: number[]; search?: string }) =>
      filters,
  ],
  (words, { statuses, search }) => {
    let filtered = words;

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

export const selectWordsStats = createSelector([selectWords], (words) => {
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
  (words, wordId) => words.find((word) => word.id === wordId)
);

export const selectPaginatedWords = createSelector(
  [
    selectWords,
    (
      _state: RootState,
      options: {
        page: number;
        pageSize: number;
        filters?: { statuses?: number[]; search?: string };
      }
    ) => options,
  ],
  (words, { page, pageSize, filters }) => {
    let filtered = words;

    // Apply filters if provided
    if (filters) {
      if (filters.statuses && filters.statuses.length > 0) {
        filtered = filtered.filter(
          (word) => word.status && filters.statuses!.includes(word.status)
        );
      }
      if (filters.search && filters.search.trim()) {
        const term = filters.search.toLowerCase();
        filtered = filtered.filter((word) =>
          word.word.toLowerCase().includes(term)
        );
      }
    }

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      words: filtered.slice(startIndex, endIndex),
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize),
      currentPage: page,
      hasNextPage: endIndex < filtered.length,
      hasPrevPage: page > 1,
    };
  }
);

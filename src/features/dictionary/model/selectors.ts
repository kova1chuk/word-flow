import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "@/shared/model/store";

export const selectPageInfo = createSelector(
  [
    (state: RootState) => state.words.loading,
    (state: RootState) => state.words.pagination,
  ],
  (loading, pagination) => {
    return {
      loading,
      pagination: {
        ...pagination,
        totalPages:
          (pagination.totalWords !== undefined && pagination.totalWords > 0) ||
          undefined,
      },
    };
  },
);

export const selectPaginatedWordIds = createSelector(
  [
    (state: RootState) => state.words.words,
    (_state: RootState, options: { page: number }) => options.page,
  ],
  (words, page) => {
    const pageWords = words[page] || [];
    return {
      wordIds: pageWords.map((word) => word.id),
    };
  },
);

export const selectWordById = createSelector(
  [
    (state: RootState) => state.words.words,
    (_state: RootState, options: { id: string; page: number }) => options.id,
    (_state: RootState, options: { id: string; page: number }) => options.page,
  ],
  (words, id, page) => {
    const pageWords = words[page] || [];
    return pageWords.find((word) => word.id === id);
  },
);

// Use direct selector for simple property access
export const selectAvailableAnalyses = (state: RootState) =>
  state.words.availableAnalyses.items;

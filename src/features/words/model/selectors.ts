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
    (_state: RootState, options: { page: number }) => options,
  ],
  (words, { page }) => {
    const pageWords = words[page] || [];

    return {
      wordIds: pageWords.map((word) => word.id),
    };
  },
);

export const selectWordById = createSelector(
  [
    (state: RootState) => state.words.words,
    (_state: RootState, options: { id: string; page: number }) => options,
  ],
  (words, { id, page }) => {
    return words[page].find((word) => word.id === id);
  },
);

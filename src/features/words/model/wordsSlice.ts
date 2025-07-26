import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  fetchWordsPage,
  reloadWordDefinition,
  reloadWordTranslation,
  removeWordFromDictionary,
  silentRefetchPage,
} from "@/features/words/model/thunks";

import type { Word } from "@/entities/word/types";

function findEntryByIdInArray<T extends { id: string }>(
  record: Record<string, T[]>,
  targetId: string,
): { key: string; value: T } | undefined {
  for (const [key, items] of Object.entries(record)) {
    const match = items.find((item) => item.id === targetId);
    if (match) return { key, value: match };
  }
  return undefined;
}

interface WordWithUpdate extends Word {
  updatingWordStatus: boolean;
  updatingWordDefinition: boolean;
  updatingWordTranslation: boolean;
  updatingWordDelete: boolean;
}

// === 🧠 State ===

interface WordsState {
  words: Record<number, WordWithUpdate[]>;
  loading: boolean;
  error: string | null;
  pagination: {
    totalWords: number;
    hasMore: boolean;
    loadedPages: number[];
  };
}

const initialState: WordsState = {
  words: {},
  loading: false,
  error: null,
  pagination: {
    totalWords: 0,
    hasMore: true,
    loadedPages: [],
  },
};

// === 🔧 Slice ===

const wordsSlice = createSlice({
  name: "words",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearWords: (state) => {
      state.words = {};
      state.pagination.totalWords = 0;
      state.pagination.hasMore = true;
      state.pagination.loadedPages = [];
    },

    addUpdatingDefinition: (state, action: PayloadAction<string>) => {
      const wordId = action.payload;
      const entry = findEntryByIdInArray(state.words, wordId);
      if (entry?.value) {
        entry.value.updatingWordDefinition = true;
      }
    },
    removeUpdatingDefinition: (state, action: PayloadAction<string>) => {
      const wordId = action.payload;
      const entry = findEntryByIdInArray(state.words, wordId);
      if (entry?.value) {
        entry.value.updatingWordDefinition = false;
      }
    },

    addUpdatingTranslation: (state, action: PayloadAction<string>) => {
      const wordId = action.payload;
      const entry = findEntryByIdInArray(state.words, wordId);
      if (entry?.value) {
        entry.value.updatingWordTranslation = true;
      }
    },
    removeUpdatingTranslation: (state, action: PayloadAction<string>) => {
      const wordId = action.payload;
      const entry = findEntryByIdInArray(state.words, wordId);
      if (entry?.value) {
        entry.value.updatingWordTranslation = false;
      }
    },

    addUpdatingStatus: (state, action: PayloadAction<string>) => {
      const wordId = action.payload;
      const entry = findEntryByIdInArray(state.words, wordId);
      if (entry?.value) {
        entry.value.updatingWordStatus = true;
      }
    },
    removeUpdatingStatus: (state, action: PayloadAction<string>) => {
      const wordId = action.payload;
      const entry = findEntryByIdInArray(state.words, wordId);
      if (entry?.value) {
        entry.value.updatingWordStatus = false;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // === 📄 Fetch Words Page
      .addCase(fetchWordsPage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWordsPage.fulfilled, (state, action) => {
        const { words: newWords, page, totalWords, hasMore } = action.payload;
        state.loading = false;
        state.words[page] = newWords.map((word) => ({
          ...word,
          updatingWordStatus: false,
          updatingWordDefinition: false,
          updatingWordTranslation: false,
          updatingWordDelete: false,
        }));

        if (!state.pagination.loadedPages.includes(page)) {
          state.pagination.loadedPages.push(page);
        }

        state.pagination.hasMore = hasMore || false;
        if (typeof totalWords === "number") {
          state.pagination.totalWords = totalWords;
        }
      })
      .addCase(fetchWordsPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch words";
      });

    builder
      // === 🔄 Silent Refetch Page
      .addCase(silentRefetchPage.fulfilled, (state, action) => {
        const { words: newWords, page, totalWords, hasMore } = action.payload;

        state.words[page] = newWords.map((word) => ({
          ...word,
          updatingWordStatus: false,
          updatingWordDefinition: false,
          updatingWordTranslation: false,
          updatingWordDelete: false,
        }));
        state.pagination.hasMore = hasMore || false;

        if (typeof totalWords === "number") {
          state.pagination.totalWords = totalWords;
        }

        if (!state.pagination.loadedPages.includes(page)) {
          state.pagination.loadedPages.push(page);
        }
      })
      .addCase(silentRefetchPage.rejected, (state, action) => {
        console.warn("Silent refetch failed:", action.error.message);
      });

    builder
      // === 🔁 Reload Definition
      .addCase(reloadWordDefinition.pending, (state, action) => {
        const { id } = action.meta.arg;
        const entry = findEntryByIdInArray(state.words, id);
        if (entry?.value) {
          entry.value.updatingWordDefinition = true;
        }
      })
      .addCase(
        reloadWordDefinition.fulfilled,
        (
          state,
          action: PayloadAction<{
            id: string;
            definition: string | null;
            newPhoneticText: string | null;
            newPhoneticAudioLink: string | null;
          }>,
        ) => {
          const { id, definition, newPhoneticText, newPhoneticAudioLink } =
            action.payload;

          const entry = findEntryByIdInArray(state.words, id);
          if (entry?.value) {
            entry.value.definition = definition ?? "";
            entry.value.phonetic.text = newPhoneticText ?? "";
            entry.value.phonetic.audio = newPhoneticAudioLink ?? "";
            entry.value.updatingWordDefinition = false;
          }
        },
      )
      .addCase(reloadWordDefinition.rejected, (state, action) => {
        const { id } = action.meta.arg;
        const entry = findEntryByIdInArray(state.words, id);
        if (entry?.value) {
          entry.value.updatingWordDefinition = false;
        }
      });

    builder
      // === 🌐 Reload Translation
      .addCase(reloadWordTranslation.pending, (state, action) => {
        const { id } = action.meta.arg;
        const entry = findEntryByIdInArray(state.words, id);
        if (entry?.value) {
          entry.value.updatingWordTranslation = true;
        }
      })
      .addCase(
        reloadWordTranslation.fulfilled,
        (
          state,
          action: PayloadAction<{
            id: string;
            translation: string;
          }>,
        ) => {
          const { id, translation } = action.payload;
          const entry = findEntryByIdInArray(state.words, id);
          if (entry?.value) {
            entry.value.translation = translation;
            entry.value.updatingWordTranslation = false;
          }
        },
      )
      .addCase(reloadWordTranslation.rejected, (state, action) => {
        const { id } = action.meta.arg;
        const entry = findEntryByIdInArray(state.words, id);
        if (entry?.value) {
          entry.value.updatingWordTranslation = false;
        }
      });

    builder
      // === 🗑️ Remove Word
      .addCase(removeWordFromDictionary.pending, (state, action) => {
        const { id } = action.meta.arg;
        const entry = findEntryByIdInArray(state.words, id);
        if (entry?.value) {
          entry.value.updatingWordDelete = true;
        }
      })
      .addCase(removeWordFromDictionary.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        const entry = findEntryByIdInArray(state.words, id);
        if (entry?.value) {
          entry.value.updatingWordDelete = false;
        }
      })
      .addCase(removeWordFromDictionary.rejected, (state, action) => {
        const { id } = action.meta.arg;
        const entry = findEntryByIdInArray(state.words, id);
        if (entry?.value) {
          entry.value.updatingWordDelete = false;
        }
      });
  },
});

// === 🧩 Exports

export const {
  clearError,
  clearWords,
  addUpdatingDefinition,
  removeUpdatingDefinition,
  addUpdatingTranslation,
  removeUpdatingTranslation,
  addUpdatingStatus,
  removeUpdatingStatus,
} = wordsSlice.actions;

export default wordsSlice.reducer;

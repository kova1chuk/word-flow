import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { updateWordStatsOnStatusChange } from "@/features/word-management/lib/updateWordStatsOnStatusChange";
import {
  fetchWordsPageSupabase,
  deleteWordSupabase,
} from "@/features/words/api/wordsSupabase";

import type { Word } from "@/entities/word/types";

import { config } from "@/lib/config";
import { db } from "@/lib/firebase";

import type { WordDetails, Phonetic } from "@/types";

interface DictionaryApiResponse {
  phonetics: { text: string; audio: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }[];
  }[];
}

interface WordsState {
  words: Record<number, Word[]>; // Store words by page number
  loading: boolean;
  error: string | null;
  updating: string | null;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalWords: number;
    hasMore: boolean;
    loadedPages: number[];
  };
}

const initialState: WordsState = {
  words: {},
  loading: false,
  error: null,
  updating: null,
  pagination: {
    currentPage: 1,
    pageSize: 12,
    totalWords: 0,
    hasMore: true,
    loadedPages: [],
  },
};

// Async thunks
export const fetchWordsCount = createAsyncThunk(
  "words/fetchWordsCount",
  async ({ userId }: { userId: string }) => {
    // Fetch the total count of words for the user
    const q = query(collection(db, "words"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  }
);

export const fetchWordsPage = createAsyncThunk(
  "words/fetchWordsPage",
  async (
    {
      userId,
      page,
      pageSize,
      statusFilter = [],
      search = "",
      analysisIds = [],
    }: {
      userId: string;
      page: number;
      pageSize: number;
      statusFilter?: number[];
      search?: string;
      analysisIds?: string[];
    },
    {}
  ) => {
    // No client-side cache for now; always fetch from Supabase
    return await fetchWordsPageSupabase({
      userId,
      page,
      pageSize,
      statusFilter,
      search,
      analysisIds,
    });
  }
);

export const deleteWord = createAsyncThunk(
  "words/deleteWord",
  async ({ wordId }: { wordId: string; userId: string }) => {
    await deleteWordSupabase(wordId);
    return wordId;
  }
);

// New action for silent background refetch
export const silentRefetchPage = createAsyncThunk(
  "words/silentRefetchPage",
  async ({
    userId,
    page,
    pageSize,
    statusFilter = [],
    search = "",
    analysisIds = [],
  }: {
    userId: string;
    page: number;
    pageSize: number;
    statusFilter?: number[];
    search?: string;
    analysisIds?: string[];
  }) => {
    return await fetchWordsPageSupabase({
      userId,
      page,
      pageSize,
      statusFilter,
      search,
      analysisIds,
    });
  }
);

export const reloadDefinition = createAsyncThunk(
  "words/reloadDefinition",
  async ({ word }: { word: Word }) => {
    let definition = "";
    let details: WordDetails | undefined = undefined;

    const res = await fetch(
      `${config.dictionaryApi}/${encodeURIComponent(word.word)}`
    );

    if (res.ok) {
      const data: DictionaryApiResponse[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const firstResult = data[0];
        definition =
          firstResult.meanings?.[0]?.definitions?.[0]?.definition ??
          "No definition found.";
        details = {
          phonetics: (firstResult.phonetics || [])
            .map((p) => ({ text: p.text, audio: p.audio }))
            .filter((p): p is Phonetic => !!(p.text && p.audio)),
          meanings: (firstResult.meanings || []).map((m) => ({
            partOfSpeech: m.partOfSpeech,
            definitions: m.definitions.map((d) => {
              const newDef: {
                definition: string;
                example?: string;
                synonyms?: string[];
                antonyms?: string[];
              } = { definition: d.definition };
              if (d.example) newDef.example = d.example;
              if (d.synonyms) newDef.synonyms = d.synonyms;
              if (d.antonyms) newDef.antonyms = d.antonyms;
              return newDef;
            }),
          })),
        };
      } else {
        definition = "No definition found.";
      }
    } else {
      definition = "No definition found.";
    }

    const dataToUpdate: { definition: string; details?: WordDetails } = {
      definition,
    };
    if (details) dataToUpdate.details = details;

    await updateDoc(doc(db, "words", word.id), dataToUpdate);
    return { wordId: word.id, updates: dataToUpdate };
  }
);

export const reloadTranslation = createAsyncThunk(
  "words/reloadTranslation",
  async ({ word }: { word: Word }) => {
    let translation = "";
    const langPair = `en|uk`;
    const url = `${config.translationApi.baseUrl}?q=${encodeURIComponent(
      word.word
    )}&langpair=${langPair}`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.responseData && data.responseData.translatedText) {
        translation = data.responseData.translatedText;
      } else {
        translation = "No translation found.";
      }
    } else {
      translation = "No translation found.";
    }

    await updateDoc(doc(db, "words", word.id), { translation });
    return { wordId: word.id, updates: { translation } };
  }
);

export const updateWordStatus = createAsyncThunk(
  "words/updateWordStatus",
  async ({
    wordId,
    status,
    userId,
    words,
  }: {
    wordId: string;
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    userId: string;
    words: Word[];
  }) => {
    const word = words.find((w) => w.id === wordId);
    if (!word) throw new Error("Word not found");

    const oldStatus = word.status;
    if (typeof oldStatus !== "number") {
      throw new Error("Old status is not a number");
    }

    await updateDoc(doc(db, "words", wordId), { status });
    await updateWordStatsOnStatusChange({
      wordId,
      userId,
      oldStatus,
      newStatus: status,
    });

    return { wordId, updates: { status } };
  }
);

const wordsSlice = createSlice({
  name: "words",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUpdating: (state, action: PayloadAction<string | null>) => {
      state.updating = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.pageSize = action.payload;
      // Reset pagination when page size changes
      state.pagination.loadedPages = [];
      state.pagination.currentPage = 1;
    },
    clearWords: (state) => {
      state.words = {};
      state.pagination.loadedPages = [];
      state.pagination.currentPage = 1;
      state.pagination.totalWords = 0;
      state.pagination.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    // Fetch words page
    builder
      .addCase(fetchWordsPage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWordsPage.fulfilled, (state, action) => {
        state.loading = false;
        const { words: newWords, page, totalWords, hasMore } = action.payload;

        // Server-side pagination mode - store words for this page
        state.words[page] = newWords;

        // Mark page as loaded
        if (!state.pagination.loadedPages.includes(page)) {
          state.pagination.loadedPages.push(page);
        }
        state.pagination.hasMore = hasMore || false;

        if (totalWords !== undefined) {
          state.pagination.totalWords = totalWords;
        }
      })
      .addCase(fetchWordsPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch words";
      });

    // Delete word
    builder
      .addCase(deleteWord.fulfilled, (state, action) => {
        const wordId = action.payload;
        // Remove word from all pages
        Object.keys(state.words).forEach((pageKey) => {
          const page = parseInt(pageKey);
          if (state.words[page]) {
            state.words[page] = state.words[page].filter(
              (word) => word.id !== wordId
            );
          }
        });

        // Update total words count
        state.pagination.totalWords = Math.max(
          0,
          state.pagination.totalWords - 1
        );

        // Don't modify currentPage here - let URL-based pagination handle page navigation
        // The URL should be the single source of truth for current page
      })
      .addCase(deleteWord.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete word";
      });

    // Silent refetch page (no loading states)
    builder
      .addCase(silentRefetchPage.fulfilled, (state, action) => {
        const { words: newWords, page, totalWords, hasMore } = action.payload;

        // Update the page data without triggering loading states
        state.words[page] = newWords;
        state.pagination.hasMore = hasMore || false;

        if (totalWords !== undefined) {
          state.pagination.totalWords = totalWords;
        }

        // Mark page as loaded if not already
        if (!state.pagination.loadedPages.includes(page)) {
          state.pagination.loadedPages.push(page);
        }

        // Don't update currentPage here - let deleteWord.fulfilled handle pagination adjustments
        // This prevents silentRefetchPage from overriding pagination changes made by deleteWord
      })
      .addCase(silentRefetchPage.rejected, (state, action) => {
        // Don't set error for silent refetch to avoid showing error messages
        console.warn("Silent refetch failed:", action.error.message);
      });

    // Reload definition
    builder
      .addCase(reloadDefinition.pending, (state, action) => {
        state.updating = action.meta.arg.word.id;
      })
      .addCase(reloadDefinition.fulfilled, (state, action) => {
        state.updating = null;
        const { wordId, updates } = action.payload;
        // Update word in all pages
        Object.keys(state.words).forEach((pageKey) => {
          const page = parseInt(pageKey);
          if (state.words[page]) {
            state.words[page] = state.words[page].map((word) =>
              word.id === wordId ? { ...word, ...updates } : word
            );
          }
        });
      })
      .addCase(reloadDefinition.rejected, (state, action) => {
        state.updating = null;
        state.error = action.error.message || "Failed to reload definition";
      });

    // Reload translation
    builder
      .addCase(reloadTranslation.pending, (state, action) => {
        state.updating = action.meta.arg.word.id;
      })
      .addCase(reloadTranslation.fulfilled, (state, action) => {
        state.updating = null;
        const { wordId, updates } = action.payload;
        // Update word in all pages
        Object.keys(state.words).forEach((pageKey) => {
          const page = parseInt(pageKey);
          if (state.words[page]) {
            state.words[page] = state.words[page].map((word) =>
              word.id === wordId ? { ...word, ...updates } : word
            );
          }
        });
      })
      .addCase(reloadTranslation.rejected, (state, action) => {
        state.updating = null;
        state.error = action.error.message || "Failed to reload translation";
      });

    // Update word status
    builder
      .addCase(updateWordStatus.pending, (state, action) => {
        state.updating = action.meta.arg.wordId;
      })
      .addCase(updateWordStatus.fulfilled, (state, action) => {
        state.updating = null;
        const { wordId, updates } = action.payload;
        // Update word in all pages
        Object.keys(state.words).forEach((pageKey) => {
          const page = parseInt(pageKey);
          if (state.words[page]) {
            state.words[page] = state.words[page].map((word) =>
              word.id === wordId ? { ...word, ...updates } : word
            );
          }
        });
      })
      .addCase(updateWordStatus.rejected, (state, action) => {
        state.updating = null;
        state.error = action.error.message || "Failed to update word status";
      });
  },
});

export const {
  clearError,
  setUpdating,
  setCurrentPage,
  setPageSize,
  clearWords,
} = wordsSlice.actions;
export default wordsSlice.reducer;

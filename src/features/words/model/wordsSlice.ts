import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { updateWordStatsOnStatusChange } from "@/features/word-management/lib/updateWordStatsOnStatusChange";

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

// Helper function to convert all Firestore Timestamps to serializable format
const serializeTimestamps = (
  data: Record<string, unknown>
): Record<string, unknown> => {
  if (!data || typeof data !== "object") return data;

  const serialized = { ...data };

  for (const [key, value] of Object.entries(serialized)) {
    if (
      value &&
      typeof value === "object" &&
      "toDate" in value &&
      typeof (value as Timestamp).toDate === "function"
    ) {
      // This is a Firestore Timestamp
      const timestamp = value as Timestamp;
      serialized[key] = timestamp.toDate().toISOString();
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      // Recursively serialize nested objects
      serialized[key] = serializeTimestamps(value as Record<string, unknown>);
    }
  }

  return serialized;
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
    { getState }
  ) => {
    const state = getState() as { words: WordsState };
    const { pagination } = state.words;

    // If we already have this page loaded and no search/filter changes, return existing data
    if (
      pagination.loadedPages.includes(page) &&
      !search &&
      statusFilter.length === 0
    ) {
      const existingWords = state.words.words[page] || [];
      return {
        words: existingWords,
        page,
        isCached: true,
        totalWords: pagination.totalWords,
        hasMore: pagination.hasMore,
        allWords: undefined,
      };
    }

    // Build the base query
    let q = query(
      collection(db, "words"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    // Add status filter if provided
    if (statusFilter.length > 0) {
      q = query(
        collection(db, "words"),
        where("userId", "==", userId),
        where("status", "in", statusFilter),
        orderBy("createdAt", "desc")
      );
    }

    // For pagination, we need to use offset
    // Since Firestore doesn't support offset directly, we'll use a different approach
    // We'll fetch all documents and paginate client-side for now
    // This is not ideal for large datasets, but it's more reliable with filters
    const querySnapshot = await getDocs(q);
    let allWords = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...serializeTimestamps(data),
        userId: data.userId ?? "",
      };
    }) as Word[];

    // Apply search filter if needed
    if (search.trim()) {
      const searchTerm = search.toLowerCase();
      allWords = allWords.filter((word) =>
        word.word.toLowerCase().includes(searchTerm)
      );
    }

    // Apply analysis filter if needed
    if (analysisIds.length > 0) {
      allWords = allWords.filter(
        (word) =>
          word.analysisIds &&
          word.analysisIds.some((id) => analysisIds.includes(id))
      );
    }

    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageWords = allWords.slice(startIndex, endIndex);
    const hasMore = endIndex < allWords.length;

    const result = {
      words: pageWords,
      page,
      totalWords: allWords.length,
      hasMore,
      isCached: false,
      allWords: undefined,
    };

    return result;
  }
);

export const deleteWord = createAsyncThunk(
  "words/deleteWord",
  async ({ wordId }: { wordId: string; userId: string }) => {
    await deleteDoc(doc(db, "words", wordId));
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
    // Use the same logic as fetchWordsPage but without triggering loading states
    // Build the base query
    let q = query(
      collection(db, "words"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    // Add status filter if provided
    if (statusFilter.length > 0) {
      q = query(
        collection(db, "words"),
        where("userId", "==", userId),
        where("status", "in", statusFilter),
        orderBy("createdAt", "desc")
      );
    }

    // Fetch all documents and paginate client-side (same as fetchWordsPage)
    const querySnapshot = await getDocs(q);
    let allWords = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...serializeTimestamps(data),
        userId: data.userId ?? "",
      };
    }) as Word[];

    // Apply search filter if needed
    if (search.trim()) {
      const searchTerm = search.toLowerCase();
      allWords = allWords.filter((word) =>
        word.word.toLowerCase().includes(searchTerm)
      );
    }

    // Apply analysis filter if needed
    if (analysisIds.length > 0) {
      allWords = allWords.filter(
        (word) =>
          word.analysisIds &&
          word.analysisIds.some((id) => analysisIds.includes(id))
      );
    }

    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageWords = allWords.slice(startIndex, endIndex);
    const hasMore = endIndex < allWords.length;

    return {
      words: pageWords,
      page,
      totalWords: allWords.length,
      hasMore,
      isCached: false,
      allWords: undefined,
    };
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
        const {
          words: newWords,
          page,
          totalWords,
          hasMore,
          isCached,
          allWords,
        } = action.payload;

        if (!isCached) {
          if (allWords) {
            // If allWords is provided (search mode), replace the entire array
            // For search mode, we'll store all words in page 1
            state.words = { 1: allWords };
          } else {
            // Server-side pagination mode - store words for this page
            state.words[page] = newWords;
          }

          // Mark page as loaded
          if (!state.pagination.loadedPages.includes(page)) {
            state.pagination.loadedPages.push(page);
          }
          state.pagination.hasMore = hasMore || false;

          if (totalWords !== undefined) {
            state.pagination.totalWords = totalWords;
          }
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

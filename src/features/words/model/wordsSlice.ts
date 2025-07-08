import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { config } from "@/lib/config";
import { updateWordStatsOnStatusChange } from "@/features/word-management/lib/updateWordStatsOnStatusChange";
import type { Word, WordDetails, Phonetic } from "@/types";
import type { Timestamp } from "firebase/firestore";

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
  words: Word[];
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
  words: [],
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
export const fetchWordsPage = createAsyncThunk(
  "words/fetchWordsPage",
  async (
    {
      userId,
      page,
      pageSize,
      statusFilter = [],
      search = "",
    }: {
      userId: string;
      page: number;
      pageSize: number;
      statusFilter?: number[];
      search?: string;
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
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const existingWords = state.words.words
        .slice(startIndex, endIndex)
        .filter(Boolean);
      return { words: existingWords, page, isCached: true };
    }

    // Build Firestore query with proper server-side pagination
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

    // For search, we need to fetch all words and filter client-side
    // For status filter, we can use Firestore query
    const querySnapshot = await getDocs(q);
    let wordsData = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...serializeTimestamps(data),
      };
    }) as Word[];

    // Sort by createdAt descending client-side
    wordsData.sort((a, b) => {
      const aDate =
        typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : 0;
      const bDate =
        typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });

    // Apply search filter client-side if needed
    if (search.trim()) {
      const searchTerm = search.toLowerCase();
      wordsData = wordsData.filter((word) =>
        word.word.toLowerCase().includes(searchTerm)
      );
    }

    // Handle pagination
    const totalWords = wordsData.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedWords = wordsData.slice(startIndex, endIndex);
    const hasMore = endIndex < totalWords;

    return {
      words: paginatedWords,
      page,
      totalWords,
      hasMore,
      isCached: false,
      allWords: wordsData, // Include all filtered words for caching
    };
  }
);

export const deleteWord = createAsyncThunk(
  "words/deleteWord",
  async ({ wordId }: { wordId: string; userId: string }) => {
    await deleteDoc(doc(db, "words", wordId));
    return wordId;
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
      state.words = [];
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
            // If allWords is provided, replace the entire array for better caching
            state.words = allWords;
          } else {
            // Insert words at the correct position for the page
            const startIndex = (page - 1) * state.pagination.pageSize;
            const endIndex = startIndex + newWords.length;

            // Ensure array is large enough
            while (state.words.length < endIndex) {
              state.words.push(null as unknown as Word);
            }

            // Insert words at the correct positions
            newWords.forEach((word: Word, index: number) => {
              state.words[startIndex + index] = word;
            });
          }

          // Mark page as loaded
          state.pagination.loadedPages.push(page);
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
        state.words = state.words.filter((word) => word.id !== action.payload);
        state.pagination.totalWords = Math.max(
          0,
          state.pagination.totalWords - 1
        );
      })
      .addCase(deleteWord.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete word";
      });

    // Reload definition
    builder
      .addCase(reloadDefinition.pending, (state, action) => {
        state.updating = action.meta.arg.word.id;
      })
      .addCase(reloadDefinition.fulfilled, (state, action) => {
        state.updating = null;
        const { wordId, updates } = action.payload;
        state.words = state.words.map((word) =>
          word.id === wordId ? { ...word, ...updates } : word
        );
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
        state.words = state.words.map((word) =>
          word.id === wordId ? { ...word, ...updates } : word
        );
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
        state.words = state.words.map((word) =>
          word.id === wordId ? { ...word, ...updates } : word
        );
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

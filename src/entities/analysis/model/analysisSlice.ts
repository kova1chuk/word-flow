import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import {
  fetchAnalysisDetails,
  fetchSentencesPage,
} from "../api/analysisService";
import {
  AnalysisState,
  AnalysisViewState,
  Analysis,
  Sentence,
  WordInfo,
  TrainingStats,
} from "../types";

// Async thunks
export const fetchAnalysis = createAsyncThunk(
  "analysis/fetchAnalysis",
  async ({ analysisId, userId }: { analysisId: string; userId: string }) => {
    const { analysis } = await fetchAnalysisDetails(analysisId, userId);
    return analysis;
  }
);

export const fetchSentences = createAsyncThunk(
  "analysis/fetchSentences",
  async ({
    analysisId,
    page,
    pageSize,
    userId,
  }: {
    analysisId: string;
    page: number;
    pageSize: number;
    userId?: string;
  }) => {
    const result = await fetchSentencesPage(analysisId, page, pageSize, userId);
    return result;
  }
);

const initialState: AnalysisState = {
  analysis: null,
  sentences: [],
  loading: false,
  error: null,
  translatedSentences: {},
  translatingSentenceId: null,
  selectedWord: null,
  wordInfoLoading: false,
  reloadingDefinition: false,
  reloadingTranslation: false,
  // Pagination states
  sentencesLoading: false,
  hasMore: true,
  lastDoc: null,
  // Training stats states
  trainingStats: null,
  trainingLoading: false,
};

const initialViewState: AnalysisViewState = {
  viewMode: "list",
  isFullScreen: false,
  currentPage: 1,
  sentencesPerPage: 20,
  showSettings: false,
};

const analysisSlice = createSlice({
  name: "analysis",
  initialState: {
    ...initialState,
    view: initialViewState,
  },
  reducers: {
    // Analysis data actions
    setAnalysis: (state, action: PayloadAction<Analysis | null>) => {
      state.analysis = action.payload;
      state.error = null;
    },
    setSentences: (state, action: PayloadAction<Sentence[]>) => {
      state.sentences = action.payload;
    },
    appendSentences: (state, action: PayloadAction<Sentence[]>) => {
      state.sentences = [...state.sentences, ...action.payload];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Pagination actions
    setSentencesLoading: (state, action: PayloadAction<boolean>) => {
      state.sentencesLoading = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },

    // Training stats actions
    setTrainingStats: (state, action: PayloadAction<TrainingStats | null>) => {
      state.trainingStats = action.payload;
    },
    setTrainingLoading: (state, action: PayloadAction<boolean>) => {
      state.trainingLoading = action.payload;
    },

    // Translation actions
    setTranslatedSentences: (
      state,
      action: PayloadAction<Record<string, string>>
    ) => {
      state.translatedSentences = action.payload;
    },
    addTranslation: (
      state,
      action: PayloadAction<{ sentenceId: string; translation: string }>
    ) => {
      state.translatedSentences[action.payload.sentenceId] =
        action.payload.translation;
    },
    setTranslatingSentenceId: (state, action: PayloadAction<string | null>) => {
      state.translatingSentenceId = action.payload;
    },

    // Word info actions
    setSelectedWord: (state, action: PayloadAction<WordInfo | null>) => {
      state.selectedWord = action.payload;
    },
    setWordInfoLoading: (state, action: PayloadAction<boolean>) => {
      state.wordInfoLoading = action.payload;
    },
    setReloadingDefinition: (state, action: PayloadAction<boolean>) => {
      state.reloadingDefinition = action.payload;
    },
    setReloadingTranslation: (state, action: PayloadAction<boolean>) => {
      state.reloadingTranslation = action.payload;
    },

    // View state actions
    setViewMode: (state, action: PayloadAction<"list" | "columns">) => {
      state.view.viewMode = action.payload;
    },
    setIsFullScreen: (state, action: PayloadAction<boolean>) => {
      state.view.isFullScreen = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.view.currentPage = action.payload;
    },
    setSentencesPerPage: (state, action: PayloadAction<number>) => {
      state.view.sentencesPerPage = action.payload;
    },
    setShowSettings: (state, action: PayloadAction<boolean>) => {
      state.view.showSettings = action.payload;
    },

    // Reset actions
    resetAnalysis: () => {
      return { ...initialState, view: initialViewState };
    },
  },
  extraReducers: (builder) => {
    // Fetch analysis
    builder
      .addCase(fetchAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis = action.payload;
        state.error = null;
      })
      .addCase(fetchAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load analysis";
      });

    // Fetch sentences
    builder
      .addCase(fetchSentences.pending, (state) => {
        state.sentencesLoading = true;
      })
      .addCase(fetchSentences.fulfilled, (state, action) => {
        state.sentencesLoading = false;
        const { sentences, hasMore } = action.payload;

        // For Supabase pagination, replace sentences instead of accumulating
        // This ensures the sentence count matches what's displayed
        state.sentences = sentences;

        // Clear translations when loading new page to prevent cross-page translation sharing
        state.translatedSentences = {};
        state.translatingSentenceId = null;

        state.hasMore = hasMore;
        state.lastDoc = null; // Always null for Supabase pagination
      })
      .addCase(fetchSentences.rejected, (state, action) => {
        state.sentencesLoading = false;
        state.error = action.error.message || "Failed to load sentences";
      });
  },
});

export const {
  setAnalysis,
  setSentences,
  appendSentences,
  setLoading,
  setError,
  setSentencesLoading,
  setHasMore,
  setTrainingStats,
  setTrainingLoading,
  setTranslatedSentences,
  addTranslation,
  setTranslatingSentenceId,
  setSelectedWord,
  setWordInfoLoading,
  setReloadingDefinition,
  setReloadingTranslation,
  setViewMode,
  setIsFullScreen,
  setCurrentPage,
  setSentencesPerPage,
  setShowSettings,
  resetAnalysis,
} = analysisSlice.actions;

export default analysisSlice.reducer;

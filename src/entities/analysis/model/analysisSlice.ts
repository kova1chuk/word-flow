import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AnalysisState,
  AnalysisViewState,
  Analysis,
  Sentence,
  WordInfo,
} from "../types";

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
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
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
});

export const {
  setAnalysis,
  setSentences,
  setLoading,
  setError,
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

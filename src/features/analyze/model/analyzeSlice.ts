import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { AnalysisResult } from "../lib/analyzeApi";

interface AnalyzeState {
  result: AnalysisResult | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  savedAnalysisId: string | null;
}

const initialState: AnalyzeState = {
  result: null,
  loading: false,
  error: null,
  saving: false,
  savedAnalysisId: null,
};

const analyzeSlice = createSlice({
  name: "analyze",
  initialState,
  reducers: {
    setResult: (state, action: PayloadAction<AnalysisResult | null>) => {
      state.result = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.saving = action.payload;
    },
    setSavedAnalysisId: (state, action: PayloadAction<string | null>) => {
      state.savedAnalysisId = action.payload;
    },
    clearResult: (state) => {
      state.result = null;
      state.error = null;
      state.savedAnalysisId = null;
    },
  },
});

export const {
  setResult,
  setLoading,
  setError,
  setSaving,
  setSavedAnalysisId,
  clearResult,
} = analyzeSlice.actions;

export default analyzeSlice.reducer;

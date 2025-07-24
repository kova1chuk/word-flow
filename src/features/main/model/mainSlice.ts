import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { UserDictionaryStatsResponse } from "@/entities/dictionary/api";

import { fetchDictionaryStats } from "./thunks";

export interface MainState {
  totalWords: number;
  wordStats: Record<string, number>;
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null;
}

const initialState: MainState = {
  totalWords: 0,
  wordStats: {},
  loading: true,
  error: null,
  lastFetchTime: null,
};

const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDictionaryStats: (state) => {
      state.totalWords = 0;
      state.wordStats = {};
      state.lastFetchTime = null;
    },
    setDictionaryStats: (
      state,
      action: PayloadAction<UserDictionaryStatsResponse>,
    ) => {
      state.totalWords = action.payload.totalWords;
      state.wordStats = action.payload.wordStats;
      state.lastFetchTime = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDictionaryStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDictionaryStats.fulfilled, (state, action) => {
        state.loading = false;
        state.totalWords = action.payload?.totalWords || 0;
        state.wordStats = action.payload?.wordStats || {};
        state.lastFetchTime = Date.now();
      })
      .addCase(fetchDictionaryStats.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch dictionary stats";
      });
  },
});

export const { clearError, clearDictionaryStats, setDictionaryStats } =
  mainSlice.actions;

export default mainSlice.reducer;

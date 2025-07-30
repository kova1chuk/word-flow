import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { fetchAnalysesSupabase, Analysis } from "../lib/analysesApi";

export interface AnalysesState {
  analyses: Analysis[];
  loading: boolean;
  error: string | null;
}

export const fetchUserAnalyses = createAsyncThunk<Analysis[], string>(
  "analyses/fetchUserAnalyses",
  async (userId: string) => {
    const result = await fetchAnalysesSupabase(userId, 1, 50); // Fetch first 50 analyses
    return result.analyses;
  }
);

const initialState: AnalysesState = {
  analyses: [],
  loading: false,
  error: null,
};

const analysesSlice = createSlice({
  name: "analyses",
  initialState,
  reducers: {
    clearAnalyses: (state) => {
      state.analyses = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserAnalyses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserAnalyses.fulfilled,
        (state, action: PayloadAction<Analysis[]>) => {
          state.loading = false;
          state.analyses = action.payload;
        }
      )
      .addCase(fetchUserAnalyses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load analyses";
      });
  },
});

export const { clearAnalyses } = analysesSlice.actions;
export default analysesSlice.reducer;

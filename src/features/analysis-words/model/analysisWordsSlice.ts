import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { supabase } from "@/lib/supabaseClient";

export interface AnalysisWord {
  id: string;
  word: string;
  isLearned: boolean;
  isInDictionary: boolean;
  usages: string[];
  definition?: string;
  translation?: string;
}

export interface AnalysisWordsStats {
  total: number;
  learned: number;
  notLearned: number;
}

export interface AnalysisWordsState {
  words: AnalysisWord[];
  loading: boolean;
  error: string | null;
  stats: AnalysisWordsStats;
}

export const fetchAnalysisWords = createAsyncThunk<
  AnalysisWord[],
  { userId: string; analysisId: string }
>("analysisWords/fetch", async ({ analysisId, userId }) => {
  // TODO: Implement Supabase analysis words fetching
  console.log("Would fetch analysis words:", { analysisId, userId });

  // Placeholder implementation
  const { data, error } = await supabase.rpc("get_analysis_words", {
    p_analysis_id: analysisId,
    p_user_id: userId,
  });

  if (error) {
    console.log("Analysis words RPC not implemented yet:", error);
    return [];
  }

  return data || [];
});

const initialState: AnalysisWordsState = {
  words: [],
  loading: false,
  error: null,
  stats: { total: 0, learned: 0, notLearned: 0 },
};

const analysisWordsSlice = createSlice({
  name: "analysisWords",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalysisWords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAnalysisWords.fulfilled,
        (state, action: PayloadAction<AnalysisWord[]>) => {
          state.loading = false;
          state.words = action.payload;
          const total = action.payload.length;
          const learned = action.payload.filter((w) => w.isLearned).length;
          state.stats = {
            total,
            learned,
            notLearned: total - learned,
          };
        }
      )
      .addCase(fetchAnalysisWords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load words";
      });
  },
});

export default analysisWordsSlice.reducer;

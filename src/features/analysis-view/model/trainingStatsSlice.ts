import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { supabase } from "@/lib/supabaseClient";

export interface TrainingStats {
  learned: number;
  notLearned: number;
  total: number;
}

export interface TrainingStatsState {
  stats: TrainingStats | null;
  loading: boolean;
  error: string | null;
}

export const fetchTrainingStats = createAsyncThunk<
  TrainingStats,
  { userId: string; analysisId: string }
>("trainingStats/fetch", async ({ analysisId, userId }) => {
  // TODO: Implement Supabase RPC for training stats
  console.log("Would fetch training stats for:", { analysisId, userId });

  // Placeholder implementation
  const { data, error } = await supabase.rpc("get_training_stats", {
    p_analysis_id: analysisId,
    p_user_id: userId,
  });

  if (error) {
    console.log("Training stats RPC not implemented yet:", error);
    // Return default stats for now
    return { learned: 0, notLearned: 0, total: 0 };
  }

  return data || { learned: 0, notLearned: 0, total: 0 };
});

const initialState: TrainingStatsState = {
  stats: null,
  loading: false,
  error: null,
};

const trainingStatsSlice = createSlice({
  name: "trainingStats",
  initialState,
  reducers: {
    clearTrainingStats: (state) => {
      state.stats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrainingStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTrainingStats.fulfilled,
        (state, action: PayloadAction<TrainingStats>) => {
          state.loading = false;
          state.stats = action.payload;
        }
      )
      .addCase(fetchTrainingStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load training stats";
      });
  },
});

export const { clearTrainingStats } = trainingStatsSlice.actions;
export default trainingStatsSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { supabase } from "@/lib/supabaseClient";

interface UserStats {
  totalWords: number;
  learnedWords: number;
  toLearnWords: number;
  toRepeatWords: number;
  userId: string;
  wordStats?: Record<number, number>; // Add word status stats
}

interface UserStatsState {
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserStatsState = {
  stats: null,
  loading: false,
  error: null,
};

// Async thunk to fetch dictionary stats from Supabase
export const fetchUserStats = createAsyncThunk(
  "userStats/fetchUserStats",
  async (userId: string) => {
    // Get the user's learning language from their profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("learning_language")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      throw new Error("Failed to fetch user profile");
    }

    const learningLanguage = profile?.learning_language || "en";

    // Use the new get_dict_stat function with user_id and lang_code
    const { data, error } = await supabase.rpc("get_dict_stat", {
      p_user_id: userId,
      p_lang_code: learningLanguage,
    });

    if (error) {
      throw error;
    }

    // The function returns a JSONB object with status counts
    // Transform it to match our expected structure
    const wordStats = data || {};

    return {
      totalWords: 0,
      learnedWords: 0,
      toLearnWords: 0,
      toRepeatWords: 0,
      userId: userId,
      wordStats: wordStats,
    } as UserStats;
  },
);

const userStatsSlice = createSlice({
  name: "userStats",
  initialState,
  reducers: {
    clearUserStats: (state) => {
      state.stats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch user stats";
      });
  },
});

export const { clearUserStats } = userStatsSlice.actions;
export default userStatsSlice.reducer;

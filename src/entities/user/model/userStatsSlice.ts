import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Types
export interface UserStats {
  wordStats: Record<number, number> | null;
}

interface UserStatsState {
  wordStats: Record<number, number> | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: UserStatsState = {
  wordStats: null,
  loading: false,
  error: null,
};

// Async thunk for fetching user stats
export const fetchUserStats = createAsyncThunk(
  "userStats/fetchUserStats",
  async (userId: string) => {
    const snap = await getDoc(doc(db, "userStats", userId));
    if (snap.exists()) {
      return snap.data().wordStats || null;
    }
    return null;
  }
);

// Slice
const userStatsSlice = createSlice({
  name: "userStats",
  initialState,
  reducers: {
    clearUserStats: (state) => {
      state.wordStats = null;
      state.loading = false;
      state.error = null;
    },
    clearUserStatsError: (state) => {
      state.error = null;
    },
    updateWordStats: (state, action: PayloadAction<Record<number, number>>) => {
      state.wordStats = action.payload;
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
        state.wordStats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch user stats";
      });
  },
});

// Actions
export const { clearUserStats, clearUserStatsError, updateWordStats } =
  userStatsSlice.actions;

// Reducer
export default userStatsSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
>("trainingStats/fetch", async ({ analysisId }) => {
  // Fetch words from the analysis words subcollection
  const analysisWordsQuery = query(
    collection(db, "analyses", analysisId, "words")
  );
  const analysisWordsSnapshot = await getDocs(analysisWordsQuery);

  // Get all word IDs from the analysis
  const wordIds = analysisWordsSnapshot.docs.map((doc) => doc.data().wordId);

  if (wordIds.length === 0) {
    return { learned: 0, notLearned: 0, total: 0 };
  }

  // Fetch the actual word documents
  const words: Record<string, unknown>[] = [];

  // Process words in chunks to avoid query limits
  const chunkSize = 10;
  for (let i = 0; i < wordIds.length; i += chunkSize) {
    const chunk = wordIds.slice(i, i + chunkSize);
    const wordsQuery = query(
      collection(db, "words"),
      where("__name__", "in", chunk)
    );
    const wordsSnapshot = await getDocs(wordsQuery);

    wordsSnapshot.forEach((doc) => {
      words.push(doc.data());
    });
  }

  // Compute stats
  let learned = 0;
  let notLearned = 0;
  for (const w of words) {
    if (w.status === "well_known") learned++;
    else notLearned++;
  }

  return { learned, notLearned, total: words.length };
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

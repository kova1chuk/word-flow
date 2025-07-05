import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
>("analysisWords/fetch", async ({ analysisId }) => {
  // Fetch word references
  const analysisWordsQuery = query(
    collection(db, "analyses", analysisId, "words")
  );
  const analysisWordsSnapshot = await getDocs(analysisWordsQuery);
  const wordIds = analysisWordsSnapshot.docs.map((doc) => doc.data().wordId);

  if (wordIds.length === 0) return [];

  // Fetch actual word docs
  const chunkSize = 10;
  const wordsData: AnalysisWord[] = [];
  for (let i = 0; i < wordIds.length; i += chunkSize) {
    const chunk = wordIds.slice(i, i + chunkSize);
    const wordsQuery = query(
      collection(db, "words"),
      where("__name__", "in", chunk)
    );
    const wordsSnapshot = await getDocs(wordsQuery);
    wordsSnapshot.forEach((doc) => {
      const data = doc.data();
      wordsData.push({
        id: doc.id,
        word: data.word,
        isLearned: !!data.isLearned,
        isInDictionary: !!data.isInDictionary,
        usages: data.usages || [],
        definition: data.definition,
        translation: data.translation,
      });
    });
  }
  return wordsData;
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

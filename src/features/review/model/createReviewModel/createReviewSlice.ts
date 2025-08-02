import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { parseReview, saveReviewData } from "./createReviewThunks";
import { CreateReviewState } from "./types";

const initialState: CreateReviewState = {
  parsed: false,
  processing: false,
  saving: false,
  saved: false,
  title: "",
  sentences: [],
  words: [],
  totalWords: 0,
  totalUniqueWords: 0,
  totalSentences: 0,
  wordsStats: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
  },
  unknownWordsCount: 0,
};

const createReviewSlice = createSlice({
  name: "createReview",
  initialState,
  reducers: {
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(parseReview.pending, (state) => {
      state.processing = true;
    });
    builder.addCase(parseReview.fulfilled, (state, action) => {
      state.processing = false;
      state.parsed = true;
      state.title = action.payload?.title || "";
      state.sentences = action.payload?.sentences || [];
      state.words =
        action.payload?.words.map((word) => ({
          text: word[0],
          usageCount: word[1],
        })) || [];
      state.totalWords = action.payload?.total_words || 0;
      state.totalUniqueWords = action.payload?.total_unique_words || 0;
      state.totalSentences = action.payload?.total_sentences || 0;
    });
    builder.addCase(saveReviewData.pending, (state) => {
      state.saving = true;
    });
    builder.addCase(saveReviewData.fulfilled, (state) => {
      state.saving = false;
      state.saved = true;
    });
    builder.addCase(saveReviewData.rejected, (state) => {
      state.saving = false;
    });
  },
});

export const { setTitle } = createReviewSlice.actions;
export default createReviewSlice.reducer;

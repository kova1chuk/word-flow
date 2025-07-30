import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Word, WordState, UpdateWordRequest } from "../types";

const initialState: WordState = {
  words: [],
  loading: false,
  error: null,
  selectedWord: null,
};

const wordSlice = createSlice({
  name: "word",
  initialState,
  reducers: {
    setWords: (state, action: PayloadAction<Word[]>) => {
      state.words = action.payload;
      state.error = null;
    },
    addWord: (state, action: PayloadAction<Word>) => {
      state.words.unshift(action.payload);
      state.error = null;
    },
    updateWord: (state, action: PayloadAction<UpdateWordRequest>) => {
      const index = state.words.findIndex(
        (word) => word.id === action.payload.id,
      );
      if (index !== -1) {
        state.words[index] = {
          ...state.words[index],
          ...action.payload,
          status: action.payload.status as unknown as Word["status"],
        };
      }
      state.error = null;
    },
    deleteWord: (state, action: PayloadAction<string>) => {
      state.words = state.words.filter((word) => word.id !== action.payload);
      state.error = null;
    },
    setSelectedWord: (state, action: PayloadAction<Word | null>) => {
      state.selectedWord = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setWords,
  addWord,
  updateWord,
  deleteWord,
  setSelectedWord,
  setLoading,
  setError,
  clearError,
} = wordSlice.actions;

export default wordSlice.reducer;

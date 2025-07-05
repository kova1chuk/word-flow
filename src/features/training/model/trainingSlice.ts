import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Timestamp } from "firebase/firestore";

interface TrainingState {
  mode: "word" | "sentence";
  isStarted: boolean;
  currentIndex: number;
  words: Word[];
  selectedStatuses: number[]; // 1-7 status values
  settings: {
    autoAdvance: boolean;
    showTranslation: boolean;
    showDefinition: boolean;
  };
}

interface Word {
  id: string;
  word: string;
  definition?: string;
  translation?: string;
  example?: string;
  status?: 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1 = not learned, 7 = very well learned
  createdAt: Timestamp;
  details?: {
    phonetics: Array<{ text: string; audio: string }>;
    meanings: Array<{
      partOfSpeech: string;
      definitions: Array<{
        definition: string;
        example?: string;
        synonyms?: string[];
        antonyms?: string[];
      }>;
    }>;
  };
  isLearned?: boolean;
  isInDictionary?: boolean;
  usages?: string[];
  analysisIds?: string[];
}

const initialState: TrainingState = {
  mode: "word",
  isStarted: false,
  currentIndex: 0,
  words: [],
  selectedStatuses: [1, 2, 3, 4, 5], // Default to all statuses except mastered
  settings: {
    autoAdvance: false,
    showTranslation: true,
    showDefinition: true,
  },
};

const trainingSlice = createSlice({
  name: "training",
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<"word" | "sentence">) => {
      state.mode = action.payload;
    },
    startTraining: (state, action: PayloadAction<Word[]>) => {
      state.words = action.payload;
      state.isStarted = true;
      state.currentIndex = 0;
    },
    stopTraining: (state) => {
      state.isStarted = false;
      state.words = [];
      state.currentIndex = 0;
    },
    nextWord: (state) => {
      if (state.currentIndex < state.words.length - 1) {
        state.currentIndex += 1;
      }
    },
    previousWord: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
      }
    },
    setCurrentIndex: (state, action: PayloadAction<number>) => {
      state.currentIndex = action.payload;
    },
    updateWordStatus: (
      state,
      action: PayloadAction<{ id: string; status: 1 | 2 | 3 | 4 | 5 | 6 | 7 }>
    ) => {
      const { id, status } = action.payload;
      const wordIndex = state.words.findIndex((w) => w.id === id);
      if (wordIndex !== -1) {
        state.words[wordIndex].status = status;
      }
    },
    toggleStatusSelection: (state, action: PayloadAction<number>) => {
      const status = action.payload;
      const index = state.selectedStatuses.indexOf(status);
      if (index > -1) {
        state.selectedStatuses.splice(index, 1);
      } else {
        state.selectedStatuses.push(status);
      }
    },
    setSelectedStatuses: (state, action: PayloadAction<number[]>) => {
      state.selectedStatuses = action.payload;
    },
    updateSettings: (
      state,
      action: PayloadAction<Partial<TrainingState["settings"]>>
    ) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
});

export const {
  setMode,
  startTraining,
  stopTraining,
  nextWord,
  previousWord,
  setCurrentIndex,
  updateWordStatus,
  toggleStatusSelection,
  setSelectedStatuses,
  updateSettings,
} = trainingSlice.actions;

export default trainingSlice.reducer;

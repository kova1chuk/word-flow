import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TrainingWord {
  id: string;
  word: string;
  definition?: string;
  translation?: string;
  status: "well_known" | "want_repeat" | "to_learn" | "unset";
}

export interface TrainingSentence {
  id: string;
  text: string;
  translation?: string;
  wordIds: string[];
}

export interface TrainingState {
  // Training mode and settings
  trainingMode: "word" | "sentence";
  selectedStatuses: string[];

  // Word training
  words: TrainingWord[];
  currentWordIndex: number;
  trainingStarted: boolean;
  trainingCompleted: boolean;

  // Sentence training
  sentences: TrainingSentence[];
  currentSentenceIndex: number;
  shuffledWords: string[];
  userAnswer: string[];
  isAnswerChecked: boolean | null;

  // Progress tracking
  totalWords: number;
  completedWords: number;
  correctAnswers: number;
  incorrectAnswers: number;

  // Loading states
  loading: boolean;
  updating: string | null; // word ID being updated
  error: string | null;
}

const initialState: TrainingState = {
  // Training mode and settings
  trainingMode: "word",
  selectedStatuses: ["to_learn", "want_repeat", "unset"],

  // Word training
  words: [],
  currentWordIndex: 0,
  trainingStarted: false,
  trainingCompleted: false,

  // Sentence training
  sentences: [],
  currentSentenceIndex: 0,
  shuffledWords: [],
  userAnswer: [],
  isAnswerChecked: null,

  // Progress tracking
  totalWords: 0,
  completedWords: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,

  // Loading states
  loading: false,
  updating: null,
  error: null,
};

const trainingSlice = createSlice({
  name: "training",
  initialState,
  reducers: {
    // Training mode and settings
    setTrainingMode: (state, action: PayloadAction<"word" | "sentence">) => {
      state.trainingMode = action.payload;
      // Reset training state when mode changes
      state.currentWordIndex = 0;
      state.currentSentenceIndex = 0;
      state.trainingStarted = false;
      state.trainingCompleted = false;
      state.completedWords = 0;
      state.correctAnswers = 0;
      state.incorrectAnswers = 0;
    },

    setSelectedStatuses: (state, action: PayloadAction<string[]>) => {
      state.selectedStatuses = action.payload;
    },

    // Word training
    setWords: (state, action: PayloadAction<TrainingWord[]>) => {
      state.words = action.payload;
      state.totalWords = action.payload.length;
      state.currentWordIndex = 0;
      state.trainingStarted = false;
      state.trainingCompleted = false;
      state.completedWords = 0;
      state.correctAnswers = 0;
      state.incorrectAnswers = 0;
    },

    setCurrentWordIndex: (state, action: PayloadAction<number>) => {
      state.currentWordIndex = action.payload;
      if (action.payload >= state.words.length) {
        state.trainingCompleted = true;
      }
    },

    setTrainingStarted: (state, action: PayloadAction<boolean>) => {
      state.trainingStarted = action.payload;
    },

    setTrainingCompleted: (state, action: PayloadAction<boolean>) => {
      state.trainingCompleted = action.payload;
    },

    // Sentence training
    setSentences: (state, action: PayloadAction<TrainingSentence[]>) => {
      state.sentences = action.payload;
      state.currentSentenceIndex = 0;
    },

    setCurrentSentenceIndex: (state, action: PayloadAction<number>) => {
      state.currentSentenceIndex = action.payload;
    },

    setShuffledWords: (state, action: PayloadAction<string[]>) => {
      state.shuffledWords = action.payload;
    },

    setUserAnswer: (state, action: PayloadAction<string[]>) => {
      state.userAnswer = action.payload;
    },

    setIsAnswerChecked: (state, action: PayloadAction<boolean | null>) => {
      state.isAnswerChecked = action.payload;
    },

    // Progress tracking
    incrementCompletedWords: (state) => {
      state.completedWords += 1;
    },

    incrementCorrectAnswers: (state) => {
      state.correctAnswers += 1;
    },

    incrementIncorrectAnswers: (state) => {
      state.incorrectAnswers += 1;
    },

    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setUpdating: (state, action: PayloadAction<string | null>) => {
      state.updating = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Reset training
    resetTraining: (state) => {
      state.currentWordIndex = 0;
      state.currentSentenceIndex = 0;
      state.trainingStarted = false;
      state.trainingCompleted = false;
      state.completedWords = 0;
      state.correctAnswers = 0;
      state.incorrectAnswers = 0;
      state.shuffledWords = [];
      state.userAnswer = [];
      state.isAnswerChecked = null;
      state.error = null;
    },

    // Complete training session
    completeTraining: (state) => {
      state.trainingCompleted = true;
      state.trainingStarted = false;
    },
  },
});

export const {
  setTrainingMode,
  setSelectedStatuses,
  setWords,
  setCurrentWordIndex,
  setTrainingStarted,
  setTrainingCompleted,
  setSentences,
  setCurrentSentenceIndex,
  setShuffledWords,
  setUserAnswer,
  setIsAnswerChecked,
  incrementCompletedWords,
  incrementCorrectAnswers,
  incrementIncorrectAnswers,
  setLoading,
  setUpdating,
  setError,
  resetTraining,
  completeTraining,
} = trainingSlice.actions;

export default trainingSlice.reducer;

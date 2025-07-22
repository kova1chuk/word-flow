import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { Word } from "@/types";

interface TrainingQuestion {
  id: string;
  word: Word;
  type: "definition" | "translation" | "usage" | "synonym";
  question: string;
  correctAnswer: string;
  options?: string[];
  userAnswer?: string;
  isCorrect?: boolean;
  timestamp?: string;
}

interface TrainingSession {
  id: string;
  startTime: string;
  endTime?: string;
  questions: TrainingQuestion[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wordsLearned: string[];
}

interface TrainingState {
  currentSession: TrainingSession | null;
  currentQuestionIndex: number;
  isSessionActive: boolean;
  sessionHistory: TrainingSession[];
  loading: boolean;
  error: string | null;
}

const initialState: TrainingState = {
  currentSession: null,
  currentQuestionIndex: 0,
  isSessionActive: false,
  sessionHistory: [],
  loading: false,
  error: null,
};

const trainingSlice = createSlice({
  name: "training",
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<TrainingQuestion[]>) => {
      const sessionId = Date.now().toString();
      state.currentSession = {
        id: sessionId,
        startTime: new Date().toISOString(),
        questions: action.payload,
        score: 0,
        totalQuestions: action.payload.length,
        correctAnswers: 0,
        wordsLearned: [],
      };
      state.currentQuestionIndex = 0;
      state.isSessionActive = true;
    },
    endSession: (state) => {
      if (state.currentSession) {
        state.currentSession.endTime = new Date().toISOString();
        state.sessionHistory.push(state.currentSession);
        state.currentSession = null;
      }
      state.isSessionActive = false;
      state.currentQuestionIndex = 0;
    },
    answerQuestion: (
      state,
      action: PayloadAction<{ answer: string; isCorrect: boolean }>
    ) => {
      if (
        state.currentSession &&
        state.currentSession.questions[state.currentQuestionIndex]
      ) {
        const currentQuestion =
          state.currentSession.questions[state.currentQuestionIndex];
        currentQuestion.userAnswer = action.payload.answer;
        currentQuestion.isCorrect = action.payload.isCorrect;
        currentQuestion.timestamp = new Date().toISOString();

        if (action.payload.isCorrect) {
          state.currentSession.correctAnswers += 1;
          state.currentSession.wordsLearned.push(currentQuestion.word.word);
        }

        state.currentSession.score = Math.round(
          (state.currentSession.correctAnswers /
            state.currentSession.totalQuestions) *
            100
        );
      }
    },
    nextQuestion: (state) => {
      if (
        state.currentSession &&
        state.currentQuestionIndex < state.currentSession.questions.length - 1
      ) {
        state.currentQuestionIndex += 1;
      }
    },
    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },
    setCurrentQuestionIndex: (state, action: PayloadAction<number>) => {
      state.currentQuestionIndex = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearHistory: (state) => {
      state.sessionHistory = [];
    },
  },
});

export const {
  startSession,
  endSession,
  answerQuestion,
  nextQuestion,
  previousQuestion,
  setCurrentQuestionIndex,
  setLoading,
  setError,
  clearHistory,
} = trainingSlice.actions;

export default trainingSlice.reducer;

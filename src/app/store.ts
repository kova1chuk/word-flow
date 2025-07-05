import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Import slices
import authSlice from "@/entities/user/model/authSlice";
import wordSlice from "@/entities/word/model/wordSlice";
import analysisSlice from "@/entities/analysis/model/analysisSlice";
import analysesSlice from "@/features/analyses/model/analysesSlice";
import analysisWordsSlice from "@/features/analysis-words/model/analysisWordsSlice";
import trainingStatsSlice from "@/features/analysis-view/model/trainingStatsSlice";
import analyzeSlice from "@/features/analyze/model/analyzeSlice";
import uiSlice from "@/shared/model/uiSlice";
import formSlice from "@/shared/model/formSlice";
import notificationSlice from "@/shared/model/notificationSlice";
import trainingSlice from "@/features/training/model/trainingSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    word: wordSlice,
    analysis: analysisSlice,
    analyses: analysesSlice,
    analysisWords: analysisWordsSlice,
    trainingStats: trainingStatsSlice,
    analyze: analyzeSlice,
    ui: uiSlice,
    form: formSlice,
    notification: notificationSlice,
    training: trainingSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        // Ignore these paths in the state
        ignoredPaths: ["items.dates"],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

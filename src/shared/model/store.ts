import { configureStore } from "@reduxjs/toolkit";

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Import slices
import trainingStatsSlice from "@/features/analysis-view/model/trainingStatsSlice";
import analysisWordsSlice from "@/features/analysis-words/model/analysisWordsSlice";
import mainSlice from "@/features/main/model/mainSlice";
import profileReducer from "@/features/profile/model/profileSlice";
import analysesSlice from "@/features/review/model/analysesSlice";
import trainingSlice from "@/features/training/model/trainingSlice";

import analysisSlice from "@/entities/analysis/model/analysisSlice";
import { dictionaryApi } from "@/entities/dictionary/api";
import authSlice from "@/entities/user/model/authSlice";
import { wordApi } from "@/entities/word/api/wordApi";
import wordSlice from "@/entities/word/model/wordSlice";

import formSlice from "@/shared/model/formSlice";
import notificationSlice from "@/shared/model/notificationSlice";
import uiSlice from "@/shared/model/uiSlice";

import { analysisApi } from "../../entities/analysis/api/analysisApi";
import { parseReviewApi, reviewApi } from "../../entities/review/api";
import wordsSlice from "../../features/dictionary/model/wordsSlice";
import createReviewSlice from "../../features/review/model/createReviewModel/createReviewSlice";

// Import RTK Query APIs

export const store = configureStore({
  reducer: {
    auth: authSlice,
    word: wordSlice,
    analysis: analysisSlice,
    analyses: analysesSlice,
    analysisWords: analysisWordsSlice,
    trainingStats: trainingStatsSlice,
    main: mainSlice,
    words: wordsSlice,
    ui: uiSlice,
    form: formSlice,
    notification: notificationSlice,
    training: trainingSlice,
    profile: profileReducer,
    createReview: createReviewSlice,

    // RTK Query APIs
    [dictionaryApi.reducerPath]: dictionaryApi.reducer,
    [wordApi.reducerPath]: wordApi.reducer,
    [analysisApi.reducerPath]: analysisApi.reducer,
    [parseReviewApi.reducerPath]: parseReviewApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST"],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          "meta.arg",
          "payload.timestamp",
          "meta.baseQueryMeta.request",
          "meta.baseQueryMeta.response",
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          "items.dates",
          "words.pagination.loadedPages",
          "words.words.deletedAt",
          "words.words.updatedAt",
          "words.words.createdAt",
          "words.words.definedAt",
          "words.words.translatedAt",
          "words.words.lastTrainedAt",
        ],
      },
    }).concat(
      // Add RTK Query middleware
      dictionaryApi.middleware,
      wordApi.middleware,
      analysisApi.middleware,
      parseReviewApi.middleware,
    ),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

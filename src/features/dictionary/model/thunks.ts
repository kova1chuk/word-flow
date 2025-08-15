import { createAsyncThunk } from "@reduxjs/toolkit";

import { dictionaryApi } from "@/entities/dictionary/api/dictionaryApi";

import { analysisApi } from "../../../entities/analysis/api/analysisApi";
import {
  wordApi,
  wordThirdDictionaryApi,
} from "../../../entities/word/api/wordApi";
import { WordStatus } from "../../../types";

export const addWord = createAsyncThunk(
  "words/addWord",
  async ({
    userId,
    langCode,
    wordText,
    page = 1,
  }: {
    userId: string;
    langCode: string;
    wordText: string;
    page?: number;
  }) => {
    // TODO: Implement actual add word functionality
    // For now, just return a mock response
    console.log("Adding word:", { userId, langCode, wordText });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      word: {
        id: `temp-${Date.now()}`,
        word: wordText,
        definition: "",
        translation: "",
        status: 1 as WordStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      page,
    };
  },
);

export const fetchWordsPage = createAsyncThunk(
  "words/fetchWordsPage",
  async (
    {
      page,
      pageSize,
      statusFilter = [],
      search = "",
      analysisIds = [],
    }: {
      page: number;
      pageSize: number;
      statusFilter?: number[];
      search?: string;
      analysisIds?: string[];
    },
    { dispatch },
  ) => {
    const result = await dispatch(
      dictionaryApi.endpoints.fetchWordsPage.initiate({
        page,
        pageSize,
        statusFilter: statusFilter.length > 0 ? statusFilter : undefined,
        search: search || undefined,
        langCode: "en",
        translationLang: "uk",
        analysesIds: analysisIds?.length > 0 ? analysisIds : undefined,
      }),
    ).unwrap();

    return {
      words: result.words || [],
      page,
      totalWords: result.totalWords || 0,
      hasMore: result.hasMore,
    };
  },
);

export const silentRefetchPage = createAsyncThunk(
  "words/silentRefetchPage",
  async (
    {
      page,
      pageSize,
      statusFilter = [],
      search = "",
      analysisIds = [],
    }: {
      page: number;
      pageSize: number;
      statusFilter?: number[];
      search?: string;
      analysisIds?: string[];
    },
    { dispatch },
  ) => {
    const result = await dispatch(
      dictionaryApi.endpoints.fetchWordsPage.initiate({
        page,
        pageSize,
        statusFilter: statusFilter.length > 0 ? statusFilter : undefined,
        search: search || undefined,
        langCode: "en",
        translationLang: "uk",
        analysesIds: analysisIds?.length > 0 ? analysisIds : undefined,
      }),
    ).unwrap();

    return {
      words: result.words || [],
      page,
      totalWords: result.totalWords || 0,
      hasMore: result.hasMore,
    };
  },
);

export const reloadWordDefinition = createAsyncThunk(
  "words/reloadWordDefinition",
  async (
    {
      langCode,
      id,
      wordText,
    }: {
      langCode: string;
      id: string;
      wordText: string;
    },
    { dispatch, rejectWithValue },
  ) => {
    const resultThird = await dispatch(
      wordThirdDictionaryApi.endpoints.getWordDefinition.initiate({
        langCode,
        wordText,
      }),
    ).unwrap();

    let definition = "";
    let newPhoneticText = "";
    let newPhoneticAudioLink = "";

    if (resultThird.meanings?.[0]?.definitions?.[0]?.definition) {
      definition = resultThird.meanings?.[0]?.definitions?.[0]?.definition;
    }

    if (resultThird.phonetics?.[0]?.text) {
      newPhoneticText = resultThird.phonetics?.[0]?.text;
    }

    if (resultThird.phonetics?.[0]?.audio) {
      newPhoneticAudioLink = resultThird.phonetics?.[0]?.audio;
    }
    if (!definition || !newPhoneticText || !newPhoneticAudioLink) {
      return rejectWithValue("No definition found");
    }

    const result = await dispatch(
      wordApi.endpoints.reloadWordDefinition.initiate({
        langCode,
        id,
        definition,
        newPhoneticText,
        newPhoneticAudioLink,
      }),
    ).unwrap();
    console.log("result", result);
    return { id, ...result };
  },
);

export const reloadWordTranslation = createAsyncThunk(
  "words/reloadWordTranslation",
  async (
    {
      langCode,
      id,
      translation,
    }: {
      langCode: string;
      id: string;
      translation: string | null;
    },
    { dispatch },
  ) => {
    const result = await dispatch(
      wordApi.endpoints.reloadWordTranslation.initiate({
        langCode,
        id,
        translation,
      }),
    ).unwrap();
    return { id, ...result };
  },
);

export const updateWordStatus = createAsyncThunk(
  "words/updateWordStatus",
  async (
    {
      langCode,
      id,
      newStatus,
    }: { langCode: string; id: string; newStatus: WordStatus },
    { dispatch },
  ) => {
    await dispatch(
      wordApi.endpoints.updateWordStatus.initiate({ langCode, id, newStatus }),
    ).unwrap();
    return { id };
  },
);

export const removeWordFromDictionary = createAsyncThunk(
  "words/removeWordFromDictionary",
  async (
    {
      langCode,
      id,
    }: {
      langCode: string;
      id: string;
    },
    { dispatch },
  ) => {
    await dispatch(
      wordApi.endpoints.removeWordFromDictionary.initiate({
        langCode,
        id,
      }),
    ).unwrap();
    return { id };
  },
);

export const fetchAnalysesForFilter = createAsyncThunk(
  "words/fetchAnalysesForFilter",
  async (langCode: string, { dispatch }) => {
    const result = await dispatch(
      analysisApi.endpoints.getAnalysesForFilter.initiate({ langCode }),
    ).unwrap();
    return result;
  },
);

import { createAsyncThunk } from "@reduxjs/toolkit";

import { dictionaryApi } from "@/entities/dictionary/api/dictionaryApi";

import { wordApi } from "../../../entities/word/api/wordApi";

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
      definition,
      newPhoneticText,
      newPhoneticAudioLink,
    }: {
      langCode: string;
      id: string;
      definition: string | null;
      newPhoneticText: string | null;
      newPhoneticAudioLink: string | null;
    },
    { dispatch },
  ) => {
    const result = await dispatch(
      wordApi.endpoints.reloadWordDefinition.initiate({
        langCode,
        id,
        definition,
        newPhoneticText,
        newPhoneticAudioLink,
      }),
    ).unwrap();
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

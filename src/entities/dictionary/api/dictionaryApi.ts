import { createApi } from "@reduxjs/toolkit/query/react";

import type {
  GetDictStatsResponse,
  UserDictionaryStatsResponse,
  FetchWordsPageResponse,
  FetchWordsPageParams,
  DictionaryWordRow,
} from "@/entities/dictionary/api/types";

import { supabaseRpcBaseQuery } from "@/shared/api";

import type { WordStatus } from "@/types";

export const dictionaryApi = createApi({
  reducerPath: "dictionaryApi",
  baseQuery: supabaseRpcBaseQuery,
  tagTypes: ["DictionaryStats", "Words"],
  endpoints: (builder) => ({
    getDictStats: builder.mutation<
      UserDictionaryStatsResponse,
      { langCode: string }
    >({
      query: ({ langCode }) => ({
        functionName: "get_dict_stat",
        args: { p_lang_code: langCode },
      }),
      invalidatesTags: ["DictionaryStats"],
      transformResponse: (response: GetDictStatsResponse) => ({
        totalWords: Object.values(response || {}).reduce(
          (sum, count) => sum + count,
          0,
        ),
        wordStats: response || {},
      }),
    }),
    fetchWordsPage: builder.mutation<
      FetchWordsPageResponse,
      FetchWordsPageParams
    >({
      query: ({
        page,
        pageSize,
        statusFilter = [],
        search = "",
        langCode = "en",
        translationLang = "uk",
        analysesIds,
      }) => ({
        functionName: "get_dictionary_words",
        args: {
          lang_code: langCode,
          translation_lang: translationLang,
          analyses_ids: analysesIds || null,
          search_text: search || null,
          status_filter: statusFilter.length > 0 ? statusFilter : null,
          limit_count: pageSize,
          offset_count: (page - 1) * pageSize,
          sort_order: "desc",
        },
      }),
      invalidatesTags: ["Words"],
      transformResponse: (
        response: DictionaryWordRow[],
        _meta,
        arg: FetchWordsPageParams,
      ) => {
        const rows = response || [];
        const totalWords = rows.length > 0 ? Number(rows[0].total_count) : 0;

        const words = rows.map((row) => ({
          id: row.word_id,
          word: row.text,
          definition: row.definition,
          translation: row.translation,
          example: undefined,
          status: parseInt(row.status) as WordStatus,
          userId: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          phonetic: {
            text: row.phonetic_text,
            audio: row.phonetic_audio_link,
          },
          analysisIds: row.in_analyses ? arg.analysesIds : undefined,
        }));

        return {
          words,
          totalWords,
          page: arg.page,
          hasMore: arg.page * arg.pageSize < totalWords,
        };
      },
    }),
  }),
});

export const { useGetDictStatsMutation, useFetchWordsPageMutation } =
  dictionaryApi;

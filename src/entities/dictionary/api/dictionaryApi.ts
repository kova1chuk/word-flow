import { createApi } from "@reduxjs/toolkit/query/react";

import { supabaseRpcBaseQuery } from "@/shared/api";

export type GetDictStatsResponse = Record<string, number>;

export interface UserDictionaryStatsResponse {
  totalWords: number;
  wordStats: Record<string, number>;
}

export const dictionaryApi = createApi({
  reducerPath: "dictionaryApi",
  baseQuery: supabaseRpcBaseQuery,
  tagTypes: ["DictionaryStats"],
  endpoints: (builder) => ({
    getDictStats: builder.mutation<
      UserDictionaryStatsResponse,
      { langCode: string }
    >({
      query: ({ langCode }) => ({
        functionName: "get_dict_stat",
        args: {
          p_lang_code: langCode,
        },
      }),
      invalidatesTags: ["DictionaryStats"],
      transformResponse: (response: GetDictStatsResponse) => {
        console.log("response", response);
        const wordStats = response || {};
        return {
          totalWords: Object.values(wordStats).reduce(
            (sum, count) => sum + count,
            0,
          ),
          wordStats,
        };
      },
    }),
  }),
});

export const { useGetDictStatsMutation } = dictionaryApi;

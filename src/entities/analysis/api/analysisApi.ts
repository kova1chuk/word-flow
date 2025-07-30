import { createApi } from "@reduxjs/toolkit/query/react";

import { supabaseRpcBaseQuery } from "../../../shared/api";

type AnalysisForFilterRow = {
  id: string;
  title: string;
};

export type AnalysesForFilterResponse = AnalysisForFilterRow[];

export const analysisApi = createApi({
  reducerPath: "analysisApi",
  baseQuery: supabaseRpcBaseQuery,
  tagTypes: ["Analysis"],
  endpoints: (builder) => ({
    getAnalysesForFilter: builder.mutation<
      AnalysesForFilterResponse,
      { langCode: string }
    >({
      query: ({ langCode }) => ({
        functionName: "get_analyses_for_filter",
        args: { lang_code: langCode },
      }),
      transformResponse: (response: AnalysisForFilterRow[]) => response,
    }),
  }),
});

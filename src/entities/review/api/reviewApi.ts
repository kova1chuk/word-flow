import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { supabaseRpcBaseQuery } from "../../../shared/api";

import { ReviewDataParsedResponse } from "./types";

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: supabaseRpcBaseQuery,
  endpoints: (builder) => ({
    saveReviewData: builder.mutation<
      ReviewDataParsedResponse,
      {
        lang_code: string;
        title: string;
        word_entries: { text: string; usage_count: number }[];
        sentences: string[];
        document_link: string | null;
      }
    >({
      query: ({
        lang_code,
        title,
        word_entries,
        sentences,
        document_link,
      }) => ({
        functionName: "save_review_data",
        args: {
          lang_code,
          title,
          word_entries,
          sentences,
          document_link,
        },
        invalidatesTags: ["Review"],
      }),
    }),
  }),
});

export const parseReviewApi = createApi({
  reducerPath: "parseReviewApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  endpoints: (builder) => ({
    parseTextUpload: builder.mutation<
      ReviewDataParsedResponse,
      { text: string }
    >({
      query: ({ text }) => ({
        url: "/api/text/",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text.trim() }),
      }),
    }),

    parseEpubUpload: builder.mutation<ReviewDataParsedResponse, { file: File }>(
      {
        query: ({ file }) => {
          const formData = new FormData();
          formData.append("file", file);

          return {
            url: "/api/epub",
            method: "POST",
            body: formData,
          };
        },
      },
    ),

    parseSubtitlesUpload: builder.mutation<
      ReviewDataParsedResponse,
      { file: File }
    >({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: "/api/subtitle",
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

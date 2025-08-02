import { createAsyncThunk } from "@reduxjs/toolkit";

import { parseReviewApi, reviewApi } from "@/entities/review/api";

export const parseReview = createAsyncThunk(
  "review/parseReview",
  async (data: File | string, { dispatch }) => {
    const extension =
      typeof data === "string"
        ? "string"
        : data.name.split(".").pop()?.toLowerCase();

    if (extension === "string") {
      return dispatch(
        parseReviewApi.endpoints.parseTextUpload.initiate({
          text: data as string,
        }),
      ).unwrap();
    } else if (extension === "srt" || extension === "vtt") {
      return dispatch(
        parseReviewApi.endpoints.parseSubtitlesUpload.initiate({
          file: data as File,
        }),
      ).unwrap();
    } else if (extension === "epub") {
      return dispatch(
        parseReviewApi.endpoints.parseEpubUpload.initiate({
          file: data as File,
        }),
      ).unwrap();
    }
  },
);

export const saveReviewData = createAsyncThunk(
  "review/saveReviewData",
  async (
    data: {
      lang_code: string;
      title: string;
      word_entries: { text: string; usage_count: number }[];
      sentences: string[];
      document_link: string | null;
    },
    { dispatch },
  ) => {
    return dispatch(reviewApi.endpoints.saveReviewData.initiate(data)).unwrap();
  },
);

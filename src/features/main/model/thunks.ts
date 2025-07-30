import { createAsyncThunk } from "@reduxjs/toolkit";

import { dictionaryApi } from "@/entities/dictionary/api";

// Async thunk that uses dictionaryApi
export const fetchDictionaryStats = createAsyncThunk(
  "main/fetchDictionaryStats",
  async ({ langCode }: { langCode: string }, { dispatch, rejectWithValue }) => {
    try {
      console.log(
        `🔍 Main thunk: Fetching dictionary stats for language ${langCode}`,
      );

      // Use the dictionary API endpoint programmatically
      const result = await dispatch(
        dictionaryApi.endpoints.getDictStats.initiate({ langCode }),
      );

      console.log("result", result);

      if (result.error) {
        console.error("❌ Dictionary API error:", result.error);
        return rejectWithValue(result.error);
      }

      console.log("✅ Dictionary stats fetched successfully:", result.data);
      return result.data;
    } catch (error) {
      console.error("❌ Main thunk error:", error);
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch dictionary stats",
      );
    }
  },
);

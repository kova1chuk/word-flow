import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { analyzeApi, AnalysisResult } from "../lib/analyzeApi";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { config } from "../lib/analyzeApi";
import { transformApiResult } from "../lib/analyzeApi";
import type { UserWord } from "../lib/analyzeApi";

async function fetchStatusesForWords(
  userId: string,
  words: string[]
): Promise<UserWord[]> {
  if (words.length === 0) return [];

  const chunkSize = 10; // Firestore 'in' operator limit
  let results: UserWord[] = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize);
    const q = query(
      collection(db, "words"),
      where("userId", "==", userId),
      where("word", "in", chunk)
    );
    const snapshot = await getDocs(q);
    results = results.concat(
      snapshot.docs.map((doc) => doc.data() as UserWord)
    );
  }
  return results;
}

export interface AnalyzeState {
  text: string;
  analysisResult: AnalysisResult | null;
  loadingAnalysis: boolean;
  saving: boolean;
  savedAnalysisId: string | null;
  error: string | null;
}

export const analyzeText = createAsyncThunk<
  AnalysisResult,
  { userId: string; text: string }
>("analyze/analyzeText", async ({ userId, text }) => {
  const response = await fetch(config.textAnalysisUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: text.trim() }),
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.statusText}`);
  }

  const apiResponse = await response.json();

  // Process user words in background
  const uniqueWords = apiResponse.unique_words || apiResponse.uniqueWords || [];
  const userWords = await fetchStatusesForWords(userId, uniqueWords);
  const finalResult = transformApiResult(apiResponse, "Pasted Text", userWords);

  return {
    ...finalResult,
    isProcessingUserWords: false,
  };
});

export const uploadSubtitleFile = createAsyncThunk<
  AnalysisResult,
  { userId: string; file: File }
>("analyze/uploadSubtitleFile", async ({ userId, file }) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(config.subtitleAnalysisUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Subtitle upload failed: ${response.statusText}`);
  }

  const apiResponse = await response.json();

  // Process user words in background
  const uniqueWords = apiResponse.unique_words || apiResponse.uniqueWords || [];
  const userWords = await fetchStatusesForWords(userId, uniqueWords);
  const finalResult = transformApiResult(apiResponse, file.name, userWords);

  return {
    ...finalResult,
    isProcessingUserWords: false,
  };
});

export const uploadGenericFile = createAsyncThunk<
  AnalysisResult,
  { userId: string; file: File }
>("analyze/uploadGenericFile", async ({ userId, file }) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(config.uploadServiceUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const apiResponse = await response.json();

  // Process user words in background
  const uniqueWords = apiResponse.unique_words || apiResponse.uniqueWords || [];
  const userWords = await fetchStatusesForWords(userId, uniqueWords);
  const finalResult = transformApiResult(apiResponse, file.name, userWords);

  return {
    ...finalResult,
    isProcessingUserWords: false,
  };
});

export const saveAnalysis = createAsyncThunk<
  string,
  { userId: string; analysisResult: AnalysisResult }
>("analyze/saveAnalysis", async ({ userId, analysisResult }) => {
  const analysisId = await analyzeApi.saveAnalysis(userId, analysisResult);
  return analysisId;
});

const initialState: AnalyzeState = {
  text: "",
  analysisResult: null,
  loadingAnalysis: false,
  saving: false,
  savedAnalysisId: null,
  error: null,
};

const analyzeSlice = createSlice({
  name: "analyze",
  initialState,
  reducers: {
    setText: (state, action: PayloadAction<string>) => {
      state.text = action.payload;
    },
    setAnalysisResult: (
      state,
      action: PayloadAction<AnalysisResult | null>
    ) => {
      state.analysisResult = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearAnalysis: (state) => {
      state.analysisResult = null;
      state.savedAnalysisId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Analyze text
      .addCase(analyzeText.pending, (state) => {
        state.loadingAnalysis = true;
        state.error = null;
      })
      .addCase(
        analyzeText.fulfilled,
        (state, action: PayloadAction<AnalysisResult>) => {
          state.loadingAnalysis = false;
          state.analysisResult = action.payload;
        }
      )
      .addCase(analyzeText.rejected, (state, action) => {
        state.loadingAnalysis = false;
        state.error = action.error.message || "Analysis failed";
      })
      // Upload subtitle file
      .addCase(uploadSubtitleFile.pending, (state) => {
        state.loadingAnalysis = true;
        state.error = null;
      })
      .addCase(
        uploadSubtitleFile.fulfilled,
        (state, action: PayloadAction<AnalysisResult>) => {
          state.loadingAnalysis = false;
          state.analysisResult = action.payload;
        }
      )
      .addCase(uploadSubtitleFile.rejected, (state, action) => {
        state.loadingAnalysis = false;
        state.error = action.error.message || "Subtitle upload failed";
      })
      // Upload generic file
      .addCase(uploadGenericFile.pending, (state) => {
        state.loadingAnalysis = true;
        state.error = null;
      })
      .addCase(
        uploadGenericFile.fulfilled,
        (state, action: PayloadAction<AnalysisResult>) => {
          state.loadingAnalysis = false;
          state.analysisResult = action.payload;
        }
      )
      .addCase(uploadGenericFile.rejected, (state, action) => {
        state.loadingAnalysis = false;
        state.error = action.error.message || "Upload failed";
      })
      // Save analysis
      .addCase(saveAnalysis.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(
        saveAnalysis.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.saving = false;
          state.savedAnalysisId = action.payload;
        }
      )
      .addCase(saveAnalysis.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to save analysis";
      });
  },
});

export const { setText, setAnalysisResult, clearError, clearAnalysis } =
  analyzeSlice.actions;
export default analyzeSlice.reducer;

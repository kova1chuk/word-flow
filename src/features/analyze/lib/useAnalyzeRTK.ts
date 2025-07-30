import { useCallback } from "react";

import { useSelector } from "react-redux";

import { selectUser } from "@/entities/user/model/selectors";

import { useAppDispatch, useAppSelector } from "@/shared/model/store";

import { useNotifications } from "@/providers/NotificationProvider";

import { setResult, setError, clearResult } from "../model/analyzeSlice";
import {
  selectAnalyzeText,
  selectAnalysisResult,
  selectAnalyzeLoading,
  selectAnalyzeSaving,
  selectSavedAnalysisId,
  selectAnalyzeError,
  selectHasAnalysisResult,
  selectAnalysisSummary,
  selectUniqueWords,
} from "../model/selectors";

import { AnalysisResult } from "./analyzeApi";

export const useAnalyzeRTK = () => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);
  const { showSuccess, showError, clearMessages } = useNotifications();

  // Selectors
  const text = useAppSelector(selectAnalyzeText);
  const analysisResult = useAppSelector(selectAnalysisResult);
  const loadingAnalysis = useAppSelector(selectAnalyzeLoading);
  const saving = useAppSelector(selectAnalyzeSaving);
  const savedAnalysisId = useAppSelector(selectSavedAnalysisId);
  const error = useAppSelector(selectAnalyzeError);
  const hasAnalysisResult = useAppSelector(selectHasAnalysisResult);
  const analysisSummary = useAppSelector(selectAnalysisSummary);
  const uniqueWords = useAppSelector(selectUniqueWords);

  // Actions
  const handleSetText = useCallback(
    (newText: string) => {
      // TODO: Implement text setting in slice
      console.log("Setting text:", newText);
    },
    [dispatch],
  );

  const handleSetAnalysisResult = useCallback(
    (result: AnalysisResult | null) => {
      dispatch(setResult(result));
    },
    [dispatch],
  );

  const handleClearError = useCallback(() => {
    dispatch(setError(null));
  }, [dispatch]);

  const handleClearAnalysis = useCallback(() => {
    dispatch(clearResult());
  }, [dispatch]);

  const handleAnalyzeText = useCallback(async () => {
    if (!user || !text.trim()) return;

    clearMessages();
    try {
      // TODO: Implement analyzeText async thunk
      console.log("Analyzing text:", { userId: user.uid, text });
      showSuccess("Text analyzed successfully!");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Analysis failed");
    }
  }, [user, text, dispatch, clearMessages, showSuccess, showError]);

  const handleSubtitleUpload = useCallback(
    async (file: File) => {
      if (!user) return;

      clearMessages();
      try {
        // TODO: Implement uploadSubtitleFile async thunk
        console.log("Uploading subtitle file:", {
          userId: user.uid,
          file: file.name,
        });
        showSuccess("Subtitle file analyzed successfully!");
      } catch (err) {
        showError(
          err instanceof Error ? err.message : "Subtitle upload failed",
        );
      }
    },
    [user, dispatch, clearMessages, showSuccess, showError],
  );

  const handleGenericUpload = useCallback(
    async (file: File) => {
      if (!user) return;

      clearMessages();
      try {
        // TODO: Implement uploadGenericFile async thunk
        console.log("Uploading generic file:", {
          userId: user.uid,
          file: file.name,
        });
        showSuccess("File uploaded and analyzed successfully!");
      } catch (err) {
        showError(err instanceof Error ? err.message : "Upload failed");
      }
    },
    [user, dispatch, clearMessages, showSuccess, showError],
  );

  const handleFileUpload = useCallback(
    (file: File) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension === "srt" || extension === "vtt") {
        handleSubtitleUpload(file);
      } else {
        handleGenericUpload(file);
      }
    },
    [handleSubtitleUpload, handleGenericUpload],
  );

  const handleSaveAnalysis = useCallback(async () => {
    if (!user || !analysisResult) return;

    clearMessages();
    try {
      // TODO: Implement saveAnalysis async thunk
      console.log("Saving analysis:", {
        userId: user.uid,
        analysisResult: analysisResult?.title,
      });
      showSuccess("Analysis saved successfully!");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to save analysis");
    }
  }, [user, analysisResult, dispatch, clearMessages, showSuccess, showError]);

  return {
    // State
    text,
    analysisResult,
    loadingAnalysis,
    saving,
    savedAnalysisId,
    error,
    hasAnalysisResult,
    analysisSummary,
    uniqueWords,

    // Actions
    handleSetText,
    handleSetAnalysisResult,
    handleAnalyzeText,
    handleFileUpload,
    handleSaveAnalysis,
    handleClearError,
    handleClearAnalysis,
    clearMessages,
  };
};

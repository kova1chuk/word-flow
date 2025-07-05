import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/providers/NotificationProvider";
import { AnalysisResult } from "../lib/analyzeApi";
import {
  analyzeText,
  uploadSubtitleFile,
  uploadGenericFile,
  saveAnalysis,
  setText,
  setAnalysisResult,
  clearError,
  clearAnalysis,
} from "../model/analyzeSlice";
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

export const useAnalyzeRTK = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
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
      dispatch(setText(newText));
    },
    [dispatch]
  );

  const handleSetAnalysisResult = useCallback(
    (result: AnalysisResult | null) => {
      dispatch(setAnalysisResult(result));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleClearAnalysis = useCallback(() => {
    dispatch(clearAnalysis());
  }, [dispatch]);

  const handleAnalyzeText = useCallback(async () => {
    if (!user || !text.trim()) return;

    clearMessages();
    try {
      await dispatch(analyzeText({ userId: user.uid, text })).unwrap();
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
        await dispatch(uploadSubtitleFile({ userId: user.uid, file })).unwrap();
        showSuccess("Subtitle file analyzed successfully!");
      } catch (err) {
        showError(
          err instanceof Error ? err.message : "Subtitle upload failed"
        );
      }
    },
    [user, dispatch, clearMessages, showSuccess, showError]
  );

  const handleGenericUpload = useCallback(
    async (file: File) => {
      if (!user) return;

      clearMessages();
      try {
        await dispatch(uploadGenericFile({ userId: user.uid, file })).unwrap();
        showSuccess("File uploaded and analyzed successfully!");
      } catch (err) {
        showError(err instanceof Error ? err.message : "Upload failed");
      }
    },
    [user, dispatch, clearMessages, showSuccess, showError]
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
    [handleSubtitleUpload, handleGenericUpload]
  );

  const handleSaveAnalysis = useCallback(async () => {
    if (!user || !analysisResult) return;

    clearMessages();
    try {
      await dispatch(
        saveAnalysis({ userId: user.uid, analysisResult })
      ).unwrap();
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
    setText: handleSetText,
    setAnalysisResult: handleSetAnalysisResult,
    analyzeText: handleAnalyzeText,
    handleFileUpload,
    handleSaveAnalysis,
    clearError: handleClearError,
    clearAnalysis: handleClearAnalysis,
    clearMessages,
  };
};

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { analyzeApi, AnalysisResult } from "./analyzeApi";

export const useAnalyze = () => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  const handleSubtitleUpload = useCallback(
    async (file: File) => {
      if (!user) return;

      clearMessages();
      setLoadingAnalysis(true);

      try {
        const result = await analyzeApi.analyzeSubtitle(file);
        setAnalysisResult(result);
        setSuccess("Subtitle file analyzed successfully!");
      } catch (err) {
        console.error("Subtitle upload error:", err);
        setError(err instanceof Error ? err.message : "Subtitle upload failed");
      } finally {
        setLoadingAnalysis(false);
      }
    },
    [user, clearMessages]
  );

  const handleGenericUpload = useCallback(
    async (file: File) => {
      if (!user) return;

      clearMessages();
      setLoadingAnalysis(true);

      try {
        const result = await analyzeApi.analyzeFile(file);
        setAnalysisResult(result);
        setSuccess("File uploaded and analyzed successfully!");
      } catch (err) {
        console.error("Upload error:", err);
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setLoadingAnalysis(false);
      }
    },
    [user, clearMessages]
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

  const analyzeText = useCallback(async () => {
    if (!user || !text.trim()) return;

    clearMessages();
    setLoadingAnalysis(true);

    try {
      const result = await analyzeApi.analyzeText(text);
      setAnalysisResult(result);
      setSuccess("Text analyzed successfully!");
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoadingAnalysis(false);
    }
  }, [user, text, clearMessages]);

  const handleSaveAnalysis = useCallback(async () => {
    if (!user || !analysisResult) return;

    setSaving(true);
    try {
      await analyzeApi.saveAnalysis(user.uid, analysisResult);
      setSuccess("Analysis saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save analysis");
    } finally {
      setSaving(false);
    }
  }, [user, analysisResult]);

  return {
    // State
    text,
    analysisResult,
    loadingAnalysis,
    saving,
    error,
    success,

    // Actions
    setText,
    handleFileUpload,
    analyzeText,
    handleSaveAnalysis,
    clearMessages,
  };
};

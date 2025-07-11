import { useState, useCallback } from "react";

import { getDocs, collection, query, where } from "firebase/firestore";

import { useSelector } from "react-redux";


import { selectUser } from "@/entities/user/model/selectors";

import { db } from "@/lib/firebase";

import { useNotifications } from "@/providers/NotificationProvider";

import { analyzeApi, AnalysisResult , config , transformApiResult } from "./analyzeApi";
import type { UserWord } from "./analyzeApi";

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

export const useAnalyze = () => {
  const user = useSelector(selectUser);
  const { showSuccess, showError, clearMessages } = useNotifications();
  const [text, setText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAnalysisId, setSavedAnalysisId] = useState<string | null>(null);

  const handleSubtitleUpload = useCallback(
    async (file: File) => {
      if (!user) return;

      clearMessages();
      setLoadingAnalysis(true);

      try {
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

        // Show basic results immediately
        const basicResult = transformApiResult(apiResponse, file.name, []);
        setAnalysisResult({
          ...basicResult,
          isProcessingUserWords: true,
        });
        setLoadingAnalysis(false);

        // Process user words in background
        const uniqueWords =
          apiResponse.unique_words || apiResponse.uniqueWords || [];
        const userWords = await fetchStatusesForWords(user.uid, uniqueWords);
        const finalResult = transformApiResult(
          apiResponse,
          file.name,
          userWords
        );
        setAnalysisResult({
          ...finalResult,
          isProcessingUserWords: false,
        });
        showSuccess("Subtitle file analyzed successfully!");
      } catch (err) {
        console.error("Subtitle upload error:", err);
        showError(
          err instanceof Error ? err.message : "Subtitle upload failed"
        );
        setLoadingAnalysis(false);
      }
    },
    [user, clearMessages, showSuccess, showError]
  );

  const handleGenericUpload = useCallback(
    async (file: File) => {
      if (!user) return;

      clearMessages();
      setLoadingAnalysis(true);

      try {
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

        // Show basic results immediately
        const basicResult = transformApiResult(apiResponse, file.name, []);
        setAnalysisResult({
          ...basicResult,
          isProcessingUserWords: true,
        });
        setLoadingAnalysis(false);

        // Process user words in background
        const uniqueWords =
          apiResponse.unique_words || apiResponse.uniqueWords || [];
        const userWords = await fetchStatusesForWords(user.uid, uniqueWords);
        const finalResult = transformApiResult(
          apiResponse,
          file.name,
          userWords
        );
        setAnalysisResult({
          ...finalResult,
          isProcessingUserWords: false,
        });
        showSuccess("File uploaded and analyzed successfully!");
      } catch (err) {
        console.error("Upload error:", err);
        showError(err instanceof Error ? err.message : "Upload failed");
        setLoadingAnalysis(false);
      }
    },
    [user, clearMessages, showSuccess, showError]
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

      // Show basic results immediately
      const basicResult = transformApiResult(apiResponse, "Pasted Text", []);
      setAnalysisResult({
        ...basicResult,
        isProcessingUserWords: true,
      });
      setLoadingAnalysis(false);

      // Process user words in background
      const uniqueWords =
        apiResponse.unique_words || apiResponse.uniqueWords || [];
      const userWords = await fetchStatusesForWords(user.uid, uniqueWords);
      const finalResult = transformApiResult(
        apiResponse,
        "Pasted Text",
        userWords
      );
      setAnalysisResult({
        ...finalResult,
        isProcessingUserWords: false,
      });
      showSuccess("Text analyzed successfully!");
    } catch (err) {
      console.error("Analysis error:", err);
      showError(err instanceof Error ? err.message : "Analysis failed");
      setLoadingAnalysis(false);
    }
  }, [user, text, clearMessages, showSuccess, showError]);

  const handleSaveAnalysis = useCallback(async () => {
    if (!user || !analysisResult) return;

    setSaving(true);
    try {
      const analysisId = await analyzeApi.saveAnalysis(
        user.uid,
        analysisResult
      );
      setSavedAnalysisId(analysisId);
      showSuccess("Analysis saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      showError("Failed to save analysis");
    } finally {
      setSaving(false);
    }
  }, [user, analysisResult, showSuccess, showError]);

  return {
    // State
    text,
    analysisResult,
    loadingAnalysis,
    saving,
    savedAnalysisId,

    // Actions
    setText,
    setAnalysisResult,
    handleFileUpload,
    analyzeText,
    handleSaveAnalysis,
    clearMessages,
  };
};

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { analyzeApi, AnalysisResult } from "./analyzeApi";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { config } from "./analyzeApi";
import { transformApiResult } from "./analyzeApi";
import type { UserWord } from "./analyzeApi";

async function fetchStatusesForWords(
  userId: string,
  words: string[]
): Promise<UserWord[]> {
  const chunkSize = 10;
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
        const uniqueWords =
          apiResponse.unique_words || apiResponse.uniqueWords || [];
        const userWords = await fetchStatusesForWords(user.uid, uniqueWords);
        setAnalysisResult(
          transformApiResult(apiResponse, file.name, userWords)
        );
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
        const uniqueWords =
          apiResponse.unique_words || apiResponse.uniqueWords || [];
        const userWords = await fetchStatusesForWords(user.uid, uniqueWords);
        setAnalysisResult(
          transformApiResult(apiResponse, file.name, userWords)
        );
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
      const uniqueWords =
        apiResponse.unique_words || apiResponse.uniqueWords || [];
      const userWords = await fetchStatusesForWords(user.uid, uniqueWords);
      setAnalysisResult(
        transformApiResult(apiResponse, "Pasted Text", userWords)
      );
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

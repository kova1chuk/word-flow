"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { config } from "@/lib/config";
import PageLoader from "@/components/PageLoader";

interface AnalysisResult {
  title: string;
  totalWords: number;
  uniqueWords: number;
  knownWords: number;
  unknownWords: number;
  wordFrequency: { [key: string]: number };
  unknownWordList: string[];
  sentences: string[];
  summary: {
    totalWords: number;
    uniqueWords: number;
    knownWords: number;
    unknownWords: number;
    averageWordLength: number;
    readingTime: number;
  };
}

export default function AnalyzePage() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    []
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!user) return;

      setError("");
      setSuccess("");
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

        const result = await response.json();
        setAnalysisResult(result);
        setSuccess("File uploaded and analyzed successfully!");
      } catch (err) {
        console.error("Upload error:", err);
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setLoadingAnalysis(false);
      }
    },
    [user]
  );

  const analyzeText = useCallback(async () => {
    if (!user || !text.trim()) return;

    setError("");
    setSuccess("");
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

      const result = await response.json();
      setAnalysisResult(result);
      setSuccess("Text analyzed successfully!");
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoadingAnalysis(false);
    }
  }, [user, text]);

  const handleSaveAnalysis = useCallback(async () => {
    if (!user || !analysisResult) return;

    setSaving(true);
    try {
      await addDoc(collection(db, "analyses"), {
        userId: user.uid,
        title: analysisResult.title,
        createdAt: Timestamp.now(),
        summary: analysisResult.summary,
        sentences: analysisResult.sentences,
      });
      setSuccess("Analysis saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save analysis");
    } finally {
      setSaving(false);
    }
  }, [user, analysisResult]);

  if (loadingAnalysis) {
    return <PageLoader text="Analyzing text..." />;
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analyze Text
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Upload files or paste text to analyze vocabulary and identify
            unknown words.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md">
            <p>{success}</p>
          </div>
        )}

        {/* File Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upload Files
          </h2>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                TXT, EPUB files up to 10MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.epub"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </div>

        {/* Text Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Or Paste Text
          </h2>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here..."
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {text.length} characters
            </span>
            <button
              onClick={analyzeText}
              disabled={!text.trim() || loadingAnalysis}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed"
            >
              {loadingAnalysis ? "Analyzing..." : "Analyze Text"}
            </button>
          </div>
        </div>

        {/* Analysis Results */}
        {analysisResult && analysisResult.summary && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Analysis Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analysisResult.summary.totalWords.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Words
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analysisResult.summary.uniqueWords.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Unique Words
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analysisResult.summary.knownWords.toLocaleString()}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Known Words
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {analysisResult.summary.unknownWords.toLocaleString()}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  Unknown Words
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Reading time: ~{analysisResult.summary.readingTime} minutes
              </div>
              <button
                onClick={handleSaveAnalysis}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Analysis"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

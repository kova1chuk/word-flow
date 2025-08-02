"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useSelector } from "react-redux";

import {
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";

import { useAnalyses } from "@/features/review/lib/useAnalyses";
import { useTrainingSession } from "@/features/training/lib/useTrainingSession";
import { TrainingQuestionCard } from "@/features/training/ui/TrainingQuestionCard";
import { TrainingSessionSummary } from "@/features/training/ui/TrainingSessionSummary";

import { selectUser } from "@/entities/user/model/selectors";

export default function SynonymMatchTrainingPage() {
  const user = useSelector(selectUser);

  // Status selection
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([
    1, 2, 3, 4, 5,
  ]);

  // URL state management
  const router = useRouter();
  const searchParams = useSearchParams();

  // Analyses selection
  const { analyses } = useAnalyses();
  const [analysesExpanded, setAnalysesExpanded] = useState(false);
  const [selectedAnalysisIds, setSelectedAnalysisIds] = useState<string[]>([]);

  // Load selected analyses from URL on component mount
  useEffect(() => {
    const analysesParam = searchParams.get("analyses");
    if (analysesParam) {
      const analysisIds = analysesParam
        .split(",")
        .filter((id) => id.trim() !== "");
      setSelectedAnalysisIds(analysisIds);
      // Auto-expand analyses section if analyses are selected
      if (analysisIds.length > 0) {
        setAnalysesExpanded(true);
      }
    }
  }, [searchParams]);

  // Update URL when selected analyses change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedAnalysisIds.length > 0) {
      params.set("analyses", selectedAnalysisIds.join(","));
    } else {
      params.delete("analyses");
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [selectedAnalysisIds, router, searchParams]);

  // Training settings
  const [sessionSize, setSessionSize] = useState(10);

  // Training session
  const {
    words,
    currentQuestion,
    currentWordIndex,
    isStarted,
    isCompleted,
    loading,
    error,
    correctAnswers,
    incorrectAnswers,
    completedWords,
    startSession,
    handleAnswer,
    skipQuestion,
    retryIncorrectAnswers,
  } = useTrainingSession({
    selectedStatuses,
    selectedAnalysisIds,
    sessionSize,
    trainingTypes: ["synonym_match"],
  });

  const STATUS_OPTIONS = [
    { value: 1, label: "Not Learned", color: "bg-gray-500" },
    { value: 2, label: "Beginner", color: "bg-red-500" },
    { value: 3, label: "Basic", color: "bg-orange-500" },
    { value: 4, label: "Intermediate", color: "bg-yellow-500" },
    { value: 5, label: "Advanced", color: "bg-blue-500" },
    { value: 6, label: "Well Known", color: "bg-green-500" },
    { value: 7, label: "Mastered", color: "bg-purple-500" },
  ];

  const toggleStatusSelection = (status: number) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const toggleAnalysis = (id: string) => {
    setSelectedAnalysisIds((prev) =>
      prev.includes(id)
        ? prev.filter((analysisId) => analysisId !== id)
        : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedAnalysisIds.length === analyses.length) {
      setSelectedAnalysisIds([]);
    } else {
      setSelectedAnalysisIds(analyses.map((a) => a.id));
    }
  };

  const getStatusCount = () => {
    return 0; // Placeholder - no stats available
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl p-4">
          <div className="py-8 text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Please sign in to access training
            </h1>
            <Link
              href="/auth/signin"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl p-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/training"
            className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Training
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Synonym Match Training
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Match words with their synonyms
          </p>
        </div>

        {/* Training Configuration */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Training Configuration
          </h2>

          {/* Status Selection */}
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
              Word Status
            </h3>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status.value}
                  onClick={() => toggleStatusSelection(status.value)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    selectedStatuses.includes(status.value)
                      ? `${status.color} text-white`
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {status.label} ({getStatusCount()})
                </button>
              ))}
            </div>
          </div>

          {/* Analyses Selection */}
          <div className="mb-6">
            <button
              onClick={() => setAnalysesExpanded(!analysesExpanded)}
              className="mb-3 flex items-center text-lg font-medium text-gray-900 dark:text-white"
            >
              {analysesExpanded ? (
                <ChevronDownIcon className="mr-2 h-5 w-5" />
              ) : (
                <ChevronRightIcon className="mr-2 h-5 w-5" />
              )}
              Analyses ({selectedAnalysisIds.length} selected)
            </button>

            {analysesExpanded && (
              <div className="ml-7 space-y-2">
                <div className="mb-2 flex items-center gap-2">
                  <button
                    onClick={toggleAll}
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {selectedAnalysisIds.length === analyses.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                {analyses.map((analysis) => (
                  <label
                    key={analysis.id}
                    className="flex cursor-pointer items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAnalysisIds.includes(analysis.id)}
                      onChange={() => toggleAnalysis(analysis.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {analysis.title}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Session Size */}
          <div className="mb-6">
            <label className="mb-3 block text-lg font-medium text-gray-900 dark:text-white">
              Session Size
            </label>
            <select
              value={sessionSize}
              onChange={(e) => setSessionSize(Number(e.target.value))}
              className="block w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value={5}>5 words</option>
              <option value={10}>10 words</option>
              <option value={15}>15 words</option>
              <option value={20}>20 words</option>
              <option value={25}>25 words</option>
              <option value={30}>30 words</option>
            </select>
          </div>

          {/* Start Session Button */}
          <button
            onClick={startSession}
            disabled={loading || selectedStatuses.length === 0}
            className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Starting..." : "Start Training Session"}
          </button>
        </div>

        {/* Training Session */}
        {isStarted && currentQuestion && (
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <TrainingQuestionCard
              question={currentQuestion}
              word={words[currentWordIndex]}
              onAnswer={handleAnswer}
              onSkip={skipQuestion}
            />
          </div>
        )}

        {/* Session Summary */}
        {isCompleted && (
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <TrainingSessionSummary
              words={words}
              correctAnswers={correctAnswers}
              incorrectAnswers={incorrectAnswers}
              completedWords={completedWords}
              onRetry={retryIncorrectAnswers}
              onNewSession={() => {
                // Reset session state
                startSession();
              }}
              onEndSession={() => {
                // Navigate back to training page
                window.location.href = "/training";
              }}
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

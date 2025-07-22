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

import { useAnalyses } from "@/features/analyses/lib/useAnalyses";
import { useTrainingSession } from "@/features/training/lib/useTrainingSession";
import { TrainingQuestionCard } from "@/features/training/ui/TrainingQuestionCard";
import { TrainingSessionSummary } from "@/features/training/ui/TrainingSessionSummary";

import { selectUser } from "@/entities/user/model/selectors";

import { useAnalysisFilteredStats } from "@/shared/hooks/useAnalysisFilteredStats";
import { useUserStatsRTK } from "@/shared/hooks/useUserStatsRTK";

export default function ChooseTranslationTrainingPage() {
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

  const { wordStats: userWordStats } = useUserStatsRTK();
  const { filteredWordStats } = useAnalysisFilteredStats(selectedAnalysisIds);

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
    progress,
    startSession,
    handleAnswer,
    skipQuestion,
    endSession,
    retryIncorrectAnswers,
    completeSession,
    nextWord,
    previousWord,
    handleStatusChange,
    handleDeleteWord,
    reloadTranslation,
  } = useTrainingSession({
    selectedStatuses,
    selectedAnalysisIds,
    sessionSize,
    trainingTypes: ["choose_translation"],
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

  const getStatusCount = (status: number) => {
    // If analyses are selected, use filtered stats; otherwise use overall stats
    if (selectedAnalysisIds.length > 0 && filteredWordStats) {
      return filteredWordStats[status] || 0;
    }
    return userWordStats?.[status] || 0;
  };

  const getTotalSelectedWords = () => {
    let total = 0;
    selectedStatuses.forEach((status) => {
      total += getStatusCount(status);
    });
    return total;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Please sign in to access training
          </h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading training...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="mb-6">
          <Link
            href="/training"
            className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-5" />
            Back to Training Selection
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Choose Translation Training
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Select the correct translation for the English word
          </p>
        </div>

        {!isStarted && !isCompleted && (
          <>
            {/* Stats Overview */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Your Learning Stats
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Object.values(userWordStats || {}).reduce(
                      (sum, count) => sum + count,
                      0,
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Words
                  </div>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {selectedAnalysisIds.length > 0
                      ? getTotalSelectedWords()
                      : Object.values(userWordStats || {}).reduce(
                          (sum, count) => sum + count,
                          0,
                        )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Available for Training
                  </div>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 text-center dark:bg-purple-900/20">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {analyses.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Analyses
                  </div>
                </div>
              </div>
            </div>

            {/* Analyses Selection */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Select Analyses (Optional)
                </h2>
                <button
                  onClick={() => setAnalysesExpanded(!analysesExpanded)}
                  className="flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {analysesExpanded ? (
                    <ChevronDownIcon className="h-5 w-5" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {analysesExpanded && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleAll}
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {selectedAnalysisIds.length === analyses.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedAnalysisIds.length} of {analyses.length} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {analyses.map((analysis) => (
                      <button
                        key={analysis.id}
                        onClick={() => toggleAnalysis(analysis.id)}
                        className={`rounded-lg border-2 p-3 text-left transition-colors ${
                          selectedAnalysisIds.includes(analysis.id)
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {analysis.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {analysis.totalWords ?? 0} words
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status Selection */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Select Word Statuses to Train
                </h2>
                {selectedAnalysisIds.length > 0 && (
                  <div className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    Filtered by {selectedAnalysisIds.length} analysis
                    {selectedAnalysisIds.length > 1 ? "es" : ""}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleStatusSelection(option.value)}
                    className={`rounded-lg border-2 p-3 transition-colors ${
                      selectedStatuses.includes(option.value)
                        ? `border-${option.color.split("-")[1]}-500 bg-${
                            option.color.split("-")[1]
                          }-50 dark:bg-${option.color.split("-")[1]}-900/20`
                        : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                    }`}
                  >
                    <div className="text-center">
                      <div
                        className={`h-3 w-3 rounded-full ${option.color} mx-auto mb-2`}
                      ></div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {getStatusCount(option.value)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Training Settings */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Training Settings
              </h2>

              {/* Session Size */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Session Size: {sessionSize} words
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={sessionSize}
                  onChange={(e) => setSessionSize(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>5</span>
                  <span>50</span>
                </div>
              </div>
            </div>

            {/* Summary and Start Button */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <div className="text-center">
                <div className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {getTotalSelectedWords()} words available
                </div>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Ready to train{" "}
                  {Math.min(sessionSize, getTotalSelectedWords())} words
                </p>

                {error && (
                  <div className="mb-4 text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <button
                  onClick={startSession}
                  disabled={
                    selectedStatuses.length === 0 ||
                    getTotalSelectedWords() === 0
                  }
                  className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  🚀 Start Choose Translation Training
                </button>
              </div>
            </div>
          </>
        )}

        {/* Training Session */}
        {isStarted && !isCompleted && currentQuestion && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress: {currentWordIndex + 1} / {words.length}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {progress.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Current Question */}
            <TrainingQuestionCard
              question={currentQuestion}
              word={words[currentWordIndex]}
              onAnswer={handleAnswer}
              onSkip={skipQuestion}
              onNext={nextWord}
              onPrevious={previousWord}
              canGoNext={currentWordIndex < words.length - 1}
              canGoPrevious={currentWordIndex > 0}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteWord}
              onReloadTranslation={reloadTranslation}
              updating={null}
            />

            {/* Complete Session Button - Show when on last word */}
            {currentWordIndex === words.length - 1 && (
              <div className="text-center">
                <button
                  onClick={completeSession}
                  className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
                >
                  ✅ Complete Session
                </button>
              </div>
            )}
          </div>
        )}

        {/* Session Summary */}
        {isCompleted && (
          <TrainingSessionSummary
            words={words}
            correctAnswers={correctAnswers}
            incorrectAnswers={incorrectAnswers}
            completedWords={completedWords}
            onRetry={retryIncorrectAnswers}
            onNewSession={() => {
              endSession();
            }}
            onEndSession={endSession}
          />
        )}
      </div>
    </div>
  );
}

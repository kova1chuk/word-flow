"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { selectUser } from "@/entities/user/model/selectors";
import { useAnalyses } from "@/features/analyses/lib/useAnalyses";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import { useUserStats } from "@/shared/hooks/useUserStats";
import { useAnalysisFilteredStats } from "@/shared/hooks/useAnalysisFilteredStats";
import { useTrainingSession } from "@/features/training/lib/useTrainingSession";
import { TrainingQuestionCard } from "@/features/training/ui/TrainingQuestionCard";
import { TrainingSessionSummary } from "@/features/training/ui/TrainingSessionSummary";
import Link from "next/link";

export default function ContextUsageTrainingPage() {
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

  const { wordStats: userWordStats } = useUserStats();
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
  } = useTrainingSession({
    selectedStatuses,
    selectedAnalysisIds,
    sessionSize,
    trainingTypes: ["context_usage"],
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
        : [...prev, status]
    );
  };

  const toggleAnalysis = (id: string) => {
    setSelectedAnalysisIds((prev) =>
      prev.includes(id)
        ? prev.filter((analysisId) => analysisId !== id)
        : [...prev, id]
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
      <div className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to access training
          </h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading training...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="mb-6">
          <Link
            href="/training"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Training Selection
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Context Usage Training
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Complete sentences with the correct word
          </p>
        </div>

        {!isStarted && !isCompleted && (
          <>
            {/* Stats Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Your Learning Stats
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Object.values(userWordStats || {}).reduce(
                      (sum, count) => sum + count,
                      0
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Words
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {selectedAnalysisIds.length > 0
                      ? getTotalSelectedWords()
                      : Object.values(userWordStats || {}).reduce(
                          (sum, count) => sum + count,
                          0
                        )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Available for Training
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Select Analyses (Optional)
                </h2>
                <button
                  onClick={() => setAnalysesExpanded(!analysesExpanded)}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
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
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {selectedAnalysisIds.length === analyses.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedAnalysisIds.length} of {analyses.length} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {analyses.map((analysis) => (
                      <button
                        key={analysis.id}
                        onClick={() => toggleAnalysis(analysis.id)}
                        className={`p-3 text-left rounded-lg border-2 transition-colors ${
                          selectedAnalysisIds.includes(analysis.id)
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {analysis.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {analysis.summary?.totalWords ?? 0} words
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Select Word Statuses to Train
                </h2>
                {selectedAnalysisIds.length > 0 && (
                  <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                    Filtered by {selectedAnalysisIds.length} analysis
                    {selectedAnalysisIds.length > 1 ? "es" : ""}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleStatusSelection(option.value)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedStatuses.includes(option.value)
                        ? `border-${option.color.split("-")[1]}-500 bg-${
                            option.color.split("-")[1]
                          }-50 dark:bg-${option.color.split("-")[1]}-900/20`
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                  >
                    <div className="text-center">
                      <div
                        className={`w-3 h-3 rounded-full ${option.color} mx-auto mb-2`}
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Training Settings
              </h2>

              {/* Session Size */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Size: {sessionSize} words
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={sessionSize}
                  onChange={(e) => setSessionSize(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>5</span>
                  <span>50</span>
                </div>
              </div>
            </div>

            {/* Summary and Start Button */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {getTotalSelectedWords()} words available
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Ready to train{" "}
                  {Math.min(sessionSize, getTotalSelectedWords())} words
                </p>

                {error && (
                  <div className="text-red-600 dark:text-red-400 mb-4">
                    {error}
                  </div>
                )}

                <button
                  onClick={startSession}
                  disabled={
                    selectedStatuses.length === 0 ||
                    getTotalSelectedWords() === 0
                  }
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
                >
                  🚀 Start Context Usage Training
                </button>
              </div>
            </div>
          </>
        )}

        {/* Training Session */}
        {isStarted && !isCompleted && currentQuestion && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress: {currentWordIndex + 1} / {words.length}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {progress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
              updating={null}
            />

            {/* Complete Session Button - Show when on last word */}
            {currentWordIndex === words.length - 1 && (
              <div className="text-center">
                <button
                  onClick={completeSession}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
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

"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useSelector } from "react-redux";

import {
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  LightBulbIcon,
  AcademicCapIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";

import { useAnalyses } from "@/features/analyses/lib/useAnalyses";
import { useTrainingSession } from "@/features/training/lib/useTrainingSession";
import { TrainingQuestionCard } from "@/features/training/ui/TrainingQuestionCard";
import { TrainingSessionSummary } from "@/features/training/ui/TrainingSessionSummary";

import { selectUser } from "@/entities/user/model/selectors";

import { useAnalysisFilteredStats } from "@/shared/hooks/useAnalysisFilteredStats";
import { useUserStatsRTK } from "@/shared/hooks/useUserStatsRTK";

export default function InputWordTrainingPage() {
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

  // Training settings
  const [sessionSize, setSessionSize] = useState(10);
  const [showAnswer, setShowAnswer] = useState(true); // Default to true for better UX

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
    trainingTypes: ["input_word"],
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            href="/training"
            className="mb-6 inline-flex items-center text-blue-600 transition-colors duration-200 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-5" />
            Back to Training Selection
          </Link>
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
              <AcademicCapIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Input Word Training
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Type the English word based on the translation
              </p>
            </div>
          </div>
        </div>

        {!isStarted && !isCompleted && (
          <>
            {/* Stats Overview */}
            <div className="mb-8 rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80">
              <div className="mb-6 flex items-center gap-3">
                <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Your Learning Stats
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center shadow-lg dark:border-blue-700 dark:from-blue-900/20 dark:to-blue-800/20">
                  <div className="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {Object.values(userWordStats || {}).reduce(
                      (sum, count) => sum + count,
                      0,
                    )}
                  </div>
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Total Words
                  </div>
                </div>
                <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6 text-center shadow-lg dark:border-green-700 dark:from-green-900/20 dark:to-green-800/20">
                  <div className="mb-2 text-3xl font-bold text-green-600 dark:text-green-400">
                    {selectedAnalysisIds.length > 0
                      ? getTotalSelectedWords()
                      : Object.values(userWordStats || {}).reduce(
                          (sum, count) => sum + count,
                          0,
                        )}
                  </div>
                  <div className="text-sm font-medium text-green-700 dark:text-green-300">
                    Available for Training
                  </div>
                </div>
                <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 text-center shadow-lg dark:border-purple-700 dark:from-purple-900/20 dark:to-purple-800/20">
                  <div className="mb-2 text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {analyses.length}
                  </div>
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Analyses
                  </div>
                </div>
              </div>
            </div>

            {/* Analyses Selection */}
            <div className="mb-8 rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Select Analyses (Optional)
                </h2>
                <button
                  onClick={() => setAnalysesExpanded(!analysesExpanded)}
                  className="flex items-center text-gray-600 transition-colors duration-200 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {analysesExpanded ? (
                    <ChevronDownIcon className="h-5 w-5" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {analysesExpanded && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={toggleAll}
                      className="text-sm font-medium text-blue-600 transition-colors duration-200 hover:underline dark:text-blue-400"
                    >
                      {selectedAnalysisIds.length === analyses.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedAnalysisIds.length} of {analyses.length} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {analyses.map((analysis) => (
                      <button
                        key={analysis.id}
                        onClick={() => toggleAnalysis(analysis.id)}
                        className={`rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                          selectedAnalysisIds.includes(analysis.id)
                            ? "border-blue-500 bg-blue-50 shadow-md dark:bg-blue-900/20"
                            : "border-gray-300 hover:border-gray-400 hover:shadow-sm dark:border-gray-600 dark:hover:border-gray-500"
                        }`}
                      >
                        <div className="mb-1 font-semibold text-gray-900 dark:text-white">
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
            <div className="mb-8 rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Select Word Statuses to Train
                </h2>
                {selectedAnalysisIds.length > 0 && (
                  <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    Filtered by {selectedAnalysisIds.length} analysis
                    {selectedAnalysisIds.length > 1 ? "es" : ""}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleStatusSelection(option.value)}
                    className={`rounded-2xl border-2 p-4 transition-all duration-200 ${
                      selectedStatuses.includes(option.value)
                        ? `border-${option.color.split("-")[1]}-500 bg-${
                            option.color.split("-")[1]
                          }-50 dark:bg-${
                            option.color.split("-")[1]
                          }-900/20 shadow-md`
                        : "border-gray-300 hover:border-gray-400 hover:shadow-sm dark:border-gray-600 dark:hover:border-gray-500"
                    }`}
                  >
                    <div className="text-center">
                      <div
                        className={`h-4 w-4 rounded-full ${option.color} mx-auto mb-3`}
                      ></div>
                      <div className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
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
            <div className="mb-8 rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Training Settings
              </h2>

              {/* Session Size */}
              <div className="mb-8">
                <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Session Size: {sessionSize} words
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={sessionSize}
                  onChange={(e) => setSessionSize(Number(e.target.value))}
                  className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                />
                <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>5</span>
                  <span>50</span>
                </div>
              </div>

              {/* Show Answer Toggle */}
              <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-6 dark:border-amber-700 dark:from-amber-900/20 dark:to-yellow-900/20">
                <div className="flex items-center gap-3">
                  <LightBulbIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Show Answer Option
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {showAnswer
                        ? "You can view the correct answer during training"
                        : "Answers will be hidden during training"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className={`rounded-xl p-3 transition-all duration-200 ${
                    showAnswer
                      ? "bg-amber-100 text-amber-600 shadow-md dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {showAnswer ? (
                    <EyeIcon className="h-6 w-6" />
                  ) : (
                    <EyeSlashIcon className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Summary and Start Button */}
            <div className="mb-8 rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80">
              <div className="text-center">
                <div className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
                  {getTotalSelectedWords()} words available
                </div>
                <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
                  Ready to train{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {Math.min(sessionSize, getTotalSelectedWords())} words
                  </span>
                </p>

                {error && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                  </div>
                )}

                <button
                  onClick={startSession}
                  disabled={
                    selectedStatuses.length === 0 ||
                    getTotalSelectedWords() === 0
                  }
                  className="transform rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-10 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  🚀 Start Input Word Training
                </button>
              </div>
            </div>
          </>
        )}

        {/* Training Session */}
        {isStarted && !isCompleted && currentQuestion && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="rounded-3xl border border-gray-200/50 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Progress: {currentWordIndex + 1} / {words.length}
                </span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {progress.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-300"
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
              showAnswer={showAnswer}
            />

            {/* Complete Session Button - Show when on last word */}
            {currentWordIndex === words.length - 1 && (
              <div className="text-center">
                <button
                  onClick={completeSession}
                  className="transform rounded-2xl bg-gradient-to-r from-green-600 to-green-700 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-green-700 hover:to-green-800 hover:shadow-xl"
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

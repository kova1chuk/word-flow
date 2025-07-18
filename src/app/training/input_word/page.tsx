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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            href="/training"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Training Selection
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
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
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Your Learning Stats
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl border border-blue-200 dark:border-blue-700 shadow-lg">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {Object.values(userWordStats || {}).reduce(
                      (sum, count) => sum + count,
                      0
                    )}
                  </div>
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Total Words
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl border border-green-200 dark:border-green-700 shadow-lg">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {selectedAnalysisIds.length > 0
                      ? getTotalSelectedWords()
                      : Object.values(userWordStats || {}).reduce(
                          (sum, count) => sum + count,
                          0
                        )}
                  </div>
                  <div className="text-sm font-medium text-green-700 dark:text-green-300">
                    Available for Training
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl border border-purple-200 dark:border-purple-700 shadow-lg">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {analyses.length}
                  </div>
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Analyses
                  </div>
                </div>
              </div>
            </div>

            {/* Analyses Selection */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Select Analyses (Optional)
                </h2>
                <button
                  onClick={() => setAnalysesExpanded(!analysesExpanded)}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
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
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200"
                    >
                      {selectedAnalysisIds.length === analyses.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedAnalysisIds.length} of {analyses.length} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analyses.map((analysis) => (
                      <button
                        key={analysis.id}
                        onClick={() => toggleAnalysis(analysis.id)}
                        className={`p-4 text-left rounded-2xl border-2 transition-all duration-200 ${
                          selectedAnalysisIds.includes(analysis.id)
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm"
                        }`}
                      >
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">
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
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Select Word Statuses to Train
                </h2>
                {selectedAnalysisIds.length > 0 && (
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full">
                    Filtered by {selectedAnalysisIds.length} analysis
                    {selectedAnalysisIds.length > 1 ? "es" : ""}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleStatusSelection(option.value)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                      selectedStatuses.includes(option.value)
                        ? `border-${option.color.split("-")[1]}-500 bg-${
                            option.color.split("-")[1]
                          }-50 dark:bg-${
                            option.color.split("-")[1]
                          }-900/20 shadow-md`
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm"
                    }`}
                  >
                    <div className="text-center">
                      <div
                        className={`w-4 h-4 rounded-full ${option.color} mx-auto mb-3`}
                      ></div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
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
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Training Settings
              </h2>

              {/* Session Size */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Session Size: {sessionSize} words
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={sessionSize}
                  onChange={(e) => setSessionSize(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>5</span>
                  <span>50</span>
                </div>
              </div>

              {/* Show Answer Toggle */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl border border-amber-200 dark:border-amber-700">
                <div className="flex items-center gap-3">
                  <LightBulbIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
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
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    showAnswer
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shadow-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
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
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {getTotalSelectedWords()} words available
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                  Ready to train{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {Math.min(sessionSize, getTotalSelectedWords())} words
                  </span>
                </p>

                {error && (
                  <div className="text-red-600 dark:text-red-400 mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}

                <button
                  onClick={startSession}
                  disabled={
                    selectedStatuses.length === 0 ||
                    getTotalSelectedWords() === 0
                  }
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
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
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Progress: {currentWordIndex + 1} / {words.length}
                </span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {progress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-blue-700 h-3 rounded-full transition-all duration-300"
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
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
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

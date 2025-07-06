"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/entities/user/model/selectors";
import { useAnalyses } from "@/features/analyses/lib/useAnalyses";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useUserStats } from "@/shared/hooks/useUserStats";
import { useTrainingSession } from "@/features/training/lib/useTrainingSession";
import { TrainingQuestionCard } from "@/features/training/ui/TrainingQuestionCard";
import { TrainingSessionSummary } from "@/features/training/ui/TrainingSessionSummary";
import type { TrainingType } from "@/types";

export default function TrainingPage() {
  const user = useSelector(selectUser);

  // Status selection
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([
    1, 2, 3, 4, 5,
  ]);

  // Analyses selection
  const { analyses, loading: analysesLoading } = useAnalyses();
  const [analysesExpanded, setAnalysesExpanded] = useState(false);
  const [selectedAnalysisIds, setSelectedAnalysisIds] = useState<string[]>([]);

  // Training settings
  const [sessionSize, setSessionSize] = useState(10);
  const [selectedTrainingTypes, setSelectedTrainingTypes] = useState<
    TrainingType[]
  >(["input_word", "choose_translation"]);

  const { wordStats: userWordStats } = useUserStats();

  // Training session
  const {
    session,
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
    accuracy,
    startSession,
    handleAnswer,
    skipQuestion,
    endSession,
  } = useTrainingSession({
    selectedStatuses,
    selectedAnalysisIds,
    sessionSize,
    trainingTypes: selectedTrainingTypes,
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

  const TRAINING_TYPE_OPTIONS = [
    {
      value: "input_word",
      label: "Input Word",
      description: "Type the English word",
    },
    {
      value: "choose_translation",
      label: "Choose Translation",
      description: "Select correct translation",
    },
    {
      value: "context_usage",
      label: "Context Usage",
      description: "Complete sentences",
    },
    {
      value: "synonym_match",
      label: "Synonym Match",
      description: "Find synonyms/antonyms",
    },
    {
      value: "audio_dictation",
      label: "Audio Dictation",
      description: "Listen and type",
    },
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

  const toggleTrainingType = (type: TrainingType) => {
    setSelectedTrainingTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const getStatusCount = (status: number) => {
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Word Training
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Practice and improve your vocabulary with interactive exercises
          </p>
        </div>

        {!isStarted && !isCompleted && (
          <>
            {/* Status Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Select Word Statuses to Train
              </h2>
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
                          {analysis.totalWords} words
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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

              {/* Training Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Training Types
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {TRAINING_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        toggleTrainingType(option.value as TrainingType)
                      }
                      className={`p-3 text-left rounded-lg border-2 transition-colors ${
                        selectedTrainingTypes.includes(
                          option.value as TrainingType
                        )
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    </button>
                  ))}
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
                  🚀 Start Training Session
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
              onAnswer={handleAnswer}
              onSkip={skipQuestion}
            />
          </div>
        )}

        {/* Session Summary */}
        {isCompleted && (
          <TrainingSessionSummary
            words={words}
            correctAnswers={correctAnswers}
            incorrectAnswers={incorrectAnswers}
            completedWords={completedWords}
            onRetry={() => {
              // TODO: Implement retry logic for incorrect answers
              endSession();
            }}
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

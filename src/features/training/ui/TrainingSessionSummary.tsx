import React from "react";

import type { Word } from "@/types";

interface TrainingSessionSummaryProps {
  words: Word[];
  correctAnswers: number;
  incorrectAnswers: number;
  completedWords: number;
  onRetry: () => void;
  onNewSession: () => void;
  onEndSession: () => void;
}

export function TrainingSessionSummary({
  words,
  correctAnswers,
  incorrectAnswers,
  completedWords,
  onRetry,
  onNewSession,
  onEndSession,
}: TrainingSessionSummaryProps) {
  const totalQuestions = correctAnswers + incorrectAnswers;
  const accuracy =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const wordsLeveledUp = words.filter((word) => (word.status || 1) > 1).length;

  // Calculate words that need retry (low status words)
  const wordsNeedingRetry = words.filter(
    (word) => (word.status || 1) <= 2,
  ).length;

  // Check if session was empty or had no questions
  const isEmptySession = words.length === 0 || totalQuestions === 0;

  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return "text-green-600 dark:text-green-400";
    if (acc >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getAccuracyEmoji = (acc: number) => {
    if (acc >= 80) return "🎉";
    if (acc >= 60) return "👍";
    return "💪";
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl bg-white p-8 shadow-md dark:bg-gray-800">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          {isEmptySession ? "Session Ended" : "Training Complete!"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {isEmptySession
            ? "No words were trained in this session."
            : "Great job! Here's how you did:"}
        </p>
      </div>

      {/* Main Stats */}
      {!isEmptySession && (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Accuracy */}
          <div className="rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-700">
            <div className={`text-4xl font-bold ${getAccuracyColor(accuracy)}`}>
              {accuracy.toFixed(1)}%
            </div>
            <div className="mb-2 text-2xl">{getAccuracyEmoji(accuracy)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Accuracy
            </div>
          </div>

          {/* Correct Answers */}
          <div className="rounded-lg bg-green-50 p-6 text-center dark:bg-green-900/20">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">
              {correctAnswers}
            </div>
            <div className="mb-2 text-2xl">✅</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Correct
            </div>
          </div>

          {/* Total Questions */}
          <div className="rounded-lg bg-blue-50 p-6 text-center dark:bg-blue-900/20">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {totalQuestions}
            </div>
            <div className="mb-2 text-2xl">📝</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats */}
      {!isEmptySession && (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Words Trained */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Words Trained:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {completedWords}
              </span>
            </div>
          </div>

          {/* Words Leveled Up */}
          <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Leveled Up:
              </span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {wordsLeveledUp}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Performance Message */}
      {isEmptySession ? (
        <div className="mb-8 text-center">
          <div className="font-medium text-gray-600 dark:text-gray-400">
            No words were available for training with the current settings.
          </div>
        </div>
      ) : (
        <div className="mb-8 text-center">
          {accuracy >= 80 && (
            <div className="font-medium text-green-600 dark:text-green-400">
              Excellent work! You&apos;re making great progress! 🚀
            </div>
          )}
          {accuracy >= 60 && accuracy < 80 && (
            <div className="font-medium text-yellow-600 dark:text-yellow-400">
              Good job! Keep practicing to improve further! 💪
            </div>
          )}
          {accuracy < 60 && (
            <div className="font-medium text-red-600 dark:text-red-400">
              Don&apos;t worry! Practice makes perfect. Try again! 📚
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <button
          onClick={onRetry}
          disabled={wordsNeedingRetry === 0 || isEmptySession}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          🔄 Retry Mistakes {wordsNeedingRetry > 0 && `(${wordsNeedingRetry})`}
        </button>
        <button
          onClick={onNewSession}
          className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
        >
          🎯 New Session
        </button>
        <button
          onClick={onEndSession}
          className="flex-1 rounded-lg bg-gray-600 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-700"
        >
          🏠 Back to Training
        </button>
      </div>

      {/* Tips */}
      <div className="mt-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
          💡 Training Tips:
        </h3>
        <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
          <li>• Practice regularly to maintain your progress</li>
          <li>• Focus on words with lower status levels</li>
          <li>• Review mistakes to learn from them</li>
          <li>• Try different training types for variety</li>
        </ul>
      </div>
    </div>
  );
}

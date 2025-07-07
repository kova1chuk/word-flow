import React from "react";
import type { Word } from "@/types";

interface TrainingSessionSummaryProps {
  words: Word[];
  correctAnswers: number;
  incorrectAnswers: number;
  completedWords: string[];
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
  const wordsLeveledUp = words.filter(
    (word) => completedWords.includes(word.id) && (word.status || 1) > 1
  ).length;

  // Calculate words that need retry (low status words)
  const wordsNeedingRetry = words.filter(
    (word) => (word.status || 1) <= 2
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Accuracy */}
          <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-4xl font-bold ${getAccuracyColor(accuracy)}`}>
              {accuracy.toFixed(1)}%
            </div>
            <div className="text-2xl mb-2">{getAccuracyEmoji(accuracy)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Accuracy
            </div>
          </div>

          {/* Correct Answers */}
          <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">
              {correctAnswers}
            </div>
            <div className="text-2xl mb-2">✅</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Correct
            </div>
          </div>

          {/* Total Questions */}
          <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {totalQuestions}
            </div>
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats */}
      {!isEmptySession && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Words Trained */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Words Trained:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {completedWords.length}
              </span>
            </div>
          </div>

          {/* Words Leveled Up */}
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
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
        <div className="text-center mb-8">
          <div className="text-gray-600 dark:text-gray-400 font-medium">
            No words were available for training with the current settings.
          </div>
        </div>
      ) : (
        <div className="text-center mb-8">
          {accuracy >= 80 && (
            <div className="text-green-600 dark:text-green-400 font-medium">
              Excellent work! You&apos;re making great progress! 🚀
            </div>
          )}
          {accuracy >= 60 && accuracy < 80 && (
            <div className="text-yellow-600 dark:text-yellow-400 font-medium">
              Good job! Keep practicing to improve further! 💪
            </div>
          )}
          {accuracy < 60 && (
            <div className="text-red-600 dark:text-red-400 font-medium">
              Don&apos;t worry! Practice makes perfect. Try again! 📚
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onRetry}
          disabled={wordsNeedingRetry === 0 || isEmptySession}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          🔄 Retry Mistakes {wordsNeedingRetry > 0 && `(${wordsNeedingRetry})`}
        </button>
        <button
          onClick={onNewSession}
          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          🎯 New Session
        </button>
        <button
          onClick={onEndSession}
          className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          🏠 Back to Training
        </button>
      </div>

      {/* Tips */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          💡 Training Tips:
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Practice regularly to maintain your progress</li>
          <li>• Focus on words with lower status levels</li>
          <li>• Review mistakes to learn from them</li>
          <li>• Try different training types for variety</li>
        </ul>
      </div>
    </div>
  );
}

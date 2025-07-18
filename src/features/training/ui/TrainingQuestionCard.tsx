import React, { useState } from "react";

import {
  TrashIcon,
  LightBulbIcon,
  EyeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

import AudioPlayer from "@/components/shared/AudioPlayer";

import { ManualTrainingCard } from "./ManualTrainingCard";

import type { TrainingQuestion, Word } from "@/types";

interface TrainingQuestionCardProps {
  question: TrainingQuestion;
  word: Word;
  onAnswer: (isCorrect: boolean) => void;
  onSkip?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  onStatusChange?: (id: string, status: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  onDelete?: (word: Word) => void;
  onReloadDefinition?: () => void;
  onReloadTranslation?: () => void;
  updating?: string | null;
  showAnswer?: boolean;
}

export function TrainingQuestionCard({
  question,
  word,
  onAnswer,
  onSkip,
  onNext,
  onPrevious,
  canGoNext = false,
  canGoPrevious = false,
  onStatusChange,
  onDelete,
  onReloadDefinition,
  onReloadTranslation,
  updating,
  showAnswer = false,
}: TrainingQuestionCardProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);

  const handleSubmit = () => {
    let correct = false;

    switch (question.type) {
      case "input_word":
        correct =
          userAnswer.toLowerCase().trim() ===
          question.correctAnswer.toLowerCase().trim();
        break;
      case "choose_translation":
      case "synonym_match":
        correct = selectedOption === question.correctAnswer;
        break;
      case "context_usage":
        correct =
          userAnswer.toLowerCase().trim() ===
          question.correctAnswer.toLowerCase().trim();
        break;
      case "audio_dictation":
        correct =
          userAnswer.toLowerCase().trim() ===
          question.correctAnswer.toLowerCase().trim();
        break;
    }

    setIsCorrect(correct);
    setIsAnswered(true);
    setShowResult(true);

    // Auto-hide result after 2 seconds
    setTimeout(() => {
      setShowResult(false);
      onAnswer(correct);
      // Reset state for next question
      setUserAnswer("");
      setSelectedOption("");
      setIsAnswered(false);
      setAnswerRevealed(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isAnswered) {
      handleSubmit();
    }
  };

  const handleShowAnswer = () => {
    setAnswerRevealed(true);
    setUserAnswer(question.correctAnswer);
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case "input_word":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                {question.question}
              </div>
              {onReloadTranslation && (
                <button
                  onClick={() => onReloadTranslation()}
                  disabled={updating === word.id}
                  className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200 font-medium text-sm"
                  title="Reload translation"
                >
                  <ArrowPathIcon
                    className={`h-4 w-4 ${
                      updating === word.id ? "animate-spin" : ""
                    }`}
                  />
                  {updating === word.id ? "Reloading..." : "Reload Translation"}
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Translation Display */}
              {word.translation && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      Current Translation:
                    </span>
                  </div>
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    {word.translation}
                  </p>
                </div>
              )}

              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isAnswered}
                className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-medium transition-all duration-200"
                placeholder="Type your answer..."
                autoFocus
              />

              {showAnswer && !isAnswered && !answerRevealed && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-700 shadow-lg">
                  <div className="flex items-center gap-3">
                    <LightBulbIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Need help with this word?
                    </span>
                  </div>
                  <button
                    onClick={handleShowAnswer}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all duration-200 font-medium text-sm"
                  >
                    <EyeIcon className="h-4 w-4" />
                    Show Answer
                  </button>
                </div>
              )}

              {answerRevealed && !isAnswered && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border-2 border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-2 mb-2">
                    <LightBulbIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Answer revealed
                    </span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    The correct answer is:{" "}
                    <span className="font-semibold">
                      {question.correctAnswer}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "choose_translation":
      case "synonym_match":
        return (
          <div className="space-y-6">
            <div className="text-xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
              {question.question}
            </div>
            <div className="grid grid-cols-1 gap-4">
              {question.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(option)}
                  disabled={isAnswered}
                  className={`p-4 text-left border-2 rounded-2xl transition-all duration-200 ${
                    selectedOption === option
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm"
                  } ${
                    isAnswered && option === question.correctAnswer
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : ""
                  } ${
                    isAnswered &&
                    selectedOption === option &&
                    option !== question.correctAnswer
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : ""
                  }`}
                >
                  <span className="text-lg text-gray-800 dark:text-gray-200">
                    {option}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case "context_usage":
        return (
          <div className="space-y-6">
            <div className="text-xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
              {question.question}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {question.context}
              </p>
            </div>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isAnswered}
              className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-medium transition-all duration-200"
              placeholder="Type the missing word..."
              autoFocus
            />
          </div>
        );

      case "audio_dictation":
        return (
          <div className="space-y-6">
            <div className="text-xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
              {question.question}
            </div>
            {question.audioUrl && (
              <div className="flex justify-center">
                <AudioPlayer audioUrl={question.audioUrl} />
              </div>
            )}
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isAnswered}
              className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-medium transition-all duration-200"
              placeholder="Type what you hear..."
              autoFocus
            />
          </div>
        );

      case "manual":
        return (
          <ManualTrainingCard
            word={word}
            onStatusChange={onStatusChange!}
            onDelete={onDelete}
            onNext={onNext!}
            onPrevious={onPrevious!}
            canGoNext={canGoNext}
            canGoPrevious={canGoPrevious}
            updating={updating}
            onReloadDefinition={onReloadDefinition}
            onReloadTranslation={onReloadTranslation}
          />
        );

      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 w-full max-w-3xl mx-auto border border-gray-200/50 dark:border-gray-700/50">
      {/* Question Type Badge */}
      <div className="mb-6">
        <span className="inline-block px-4 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-200 shadow-sm">
          {question.type.replace("_", " ").toUpperCase()}
        </span>
      </div>

      {/* Question Content */}
      {renderQuestionContent()}

      {/* Result Feedback */}
      {showResult && (
        <div
          className={`mt-6 p-6 rounded-2xl border-2 ${
            isCorrect
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
          }`}
        >
          <div
            className={`text-xl font-semibold ${
              isCorrect
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200"
            }`}
          >
            {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
          </div>
          {!isCorrect && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Correct answer:{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {question.correctAnswer}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8">
        <div className="flex gap-4">
          {onSkip && (
            <button
              onClick={onSkip}
              disabled={isAnswered}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 transition-colors duration-200 font-medium"
            >
              Skip
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(word)}
              className="px-6 py-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200 flex items-center gap-2 font-medium"
              title="Delete word"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
        <div className="flex gap-4">
          {(question.type === "input_word" ||
            question.type === "context_usage" ||
            question.type === "audio_dictation") && (
            <button
              onClick={handleSubmit}
              disabled={isAnswered || !userAnswer.trim()}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Submit
            </button>
          )}
          {(question.type === "choose_translation" ||
            question.type === "synonym_match") && (
            <button
              onClick={handleSubmit}
              disabled={isAnswered || !selectedOption}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

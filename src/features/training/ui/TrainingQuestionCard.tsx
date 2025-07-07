import React, { useState } from "react";
import type { TrainingQuestion, Word } from "@/types";
import AudioPlayer from "@/components/shared/AudioPlayer";
import { ManualTrainingCard } from "./ManualTrainingCard";

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
  updating?: string | null;
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
  updating,
}: TrainingQuestionCardProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResult, setShowResult] = useState(false);

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
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isAnswered) {
      handleSubmit();
    }
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case "input_word":
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
              {question.question}
            </div>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isAnswered}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
              placeholder="Type your answer..."
              autoFocus
            />
          </div>
        );

      case "choose_translation":
      case "synonym_match":
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
              {question.question}
            </div>
            <div className="grid grid-cols-1 gap-3">
              {question.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(option)}
                  disabled={isAnswered}
                  className={`p-4 text-left border rounded-lg transition-colors ${
                    selectedOption === option
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
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
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
              {question.question}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {question.context}
              </p>
            </div>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isAnswered}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
              placeholder="Type the missing word..."
              autoFocus
            />
          </div>
        );

      case "audio_dictation":
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
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
          />
        );

      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 w-full max-w-2xl mx-auto">
      {/* Question Type Badge */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {question.type.replace("_", " ").toUpperCase()}
        </span>
      </div>

      {/* Question Content */}
      {renderQuestionContent()}

      {/* Result Feedback */}
      {showResult && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            isCorrect
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          }`}
        >
          <div
            className={`text-lg font-medium ${
              isCorrect
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200"
            }`}
          >
            {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
          </div>
          {!isCorrect && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Correct answer:{" "}
              <span className="font-medium">{question.correctAnswer}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between mt-6">
        {onSkip && (
          <button
            onClick={onSkip}
            disabled={isAnswered}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
          >
            Skip
          </button>
        )}
        <div className="flex gap-3">
          {(question.type === "input_word" ||
            question.type === "context_usage" ||
            question.type === "audio_dictation") && (
            <button
              onClick={handleSubmit}
              disabled={isAnswered || !userAnswer.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          )}
          {(question.type === "choose_translation" ||
            question.type === "synonym_match") && (
            <button
              onClick={handleSubmit}
              disabled={isAnswered || !selectedOption}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

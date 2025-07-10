import React from "react";
import type { Word } from "@/types";
import WordDisplay from "@/components/shared/WordDisplay";
import StatusSelector from "@/components/shared/StatusSelector";
import AudioPlayer from "@/components/shared/AudioPlayer";
import ReloadButton from "@/components/shared/ReloadButton";

interface ManualTrainingCardProps {
  word: Word;
  onStatusChange: (id: string, status: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  onDelete?: (word: Word) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onReloadDefinition?: () => void;
  onReloadTranslation?: () => void;
  updating?: string | null;
}

export function ManualTrainingCard({
  word,
  onStatusChange,
  onDelete,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  onReloadDefinition,
  onReloadTranslation,
  updating,
}: ManualTrainingCardProps) {
  const handleStatusChange = (
    id: string,
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7
  ) => {
    onStatusChange(id, status);
    // Auto-advance to next word after status change
    if (canGoNext) {
      setTimeout(() => onNext(), 500);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 w-full max-w-2xl mx-auto">
      {/* Training Type Badge */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          MANUAL REVIEW
        </span>
      </div>

      {/* Word Display */}
      <div className="mb-6">
        <WordDisplay word={word} size="lg" />
        {word.details?.phonetics?.[0]?.audio && (
          <div className="mt-4 flex justify-center">
            <AudioPlayer audioUrl={word.details.phonetics[0].audio} />
          </div>
        )}
      </div>

      {/* Word Details */}
      <div className="space-y-4 mb-6">
        {/* Definition */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
              Definition:
            </h4>
            {(!word.definition || word.definition === "No definition found.") &&
              onReloadDefinition && (
                <ReloadButton
                  onClick={onReloadDefinition}
                  disabled={updating === word.id}
                />
              )}
          </div>
          <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
            {word.definition || (
              <span className="text-gray-400 dark:text-gray-500">(none)</span>
            )}
          </p>
        </div>

        {/* Translation */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-green-700 dark:text-green-400 text-sm">
              Translation:
            </h4>
            {(!word.translation ||
              word.translation === "No translation found.") &&
              onReloadTranslation && (
                <ReloadButton
                  onClick={onReloadTranslation}
                  disabled={updating === word.id}
                />
              )}
          </div>
          <p className="text-green-700 dark:text-green-400 text-sm">
            {word.translation || (
              <span className="text-gray-400 dark:text-gray-500">(none)</span>
            )}
          </p>
        </div>

        {/* Example */}
        {word.example && (
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">
              Example:
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm italic">
              &ldquo;{word.example}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Status Selector */}
      <div className="mb-6">
        <StatusSelector
          word={word}
          onStatusChange={handleStatusChange}
          updating={updating}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(word)}
            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            Delete Word
          </button>
        )}
      </div>
    </div>
  );
}

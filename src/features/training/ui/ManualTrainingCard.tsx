import React from "react";

import AudioPlayer from "@/components/shared/AudioPlayer";
import ReloadButton from "@/components/shared/ReloadButton";
// import StatusSelector from "@/components/shared/StatusSelector";
import WordDisplay from "@/components/shared/WordDisplay";

import { Word } from "../../../entities/word";

interface ManualTrainingCardProps {
  word: Word;
  // onStatusChange: (id: string, status: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
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
  // onStatusChange,
  onDelete,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  onReloadDefinition,
  onReloadTranslation,
  updating,
}: ManualTrainingCardProps) {
  // const handleStatusChange = (
  //   id: string,
  //   status: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  // ) => {
  //   onStatusChange(id, status);
  //   // Auto-advance to next word after status change
  //   if (canGoNext) {
  //     setTimeout(() => onNext(), 500);
  //   }
  // };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
      {/* Training Type Badge */}
      <div className="mb-4">
        <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
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
      <div className="mb-6 space-y-4">
        {/* Definition */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
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
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
            {word.definition || (
              <span className="text-gray-400 dark:text-gray-500">(none)</span>
            )}
          </p>
        </div>

        {/* Translation */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h4 className="text-sm font-semibold text-green-700 dark:text-green-400">
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
          <p className="text-sm text-green-700 dark:text-green-400">
            {word.translation || (
              <span className="text-gray-400 dark:text-gray-500">(none)</span>
            )}
          </p>
        </div>

        {/* Example */}
        {word.example && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Example:
            </h4>
            <p className="text-sm text-gray-600 italic dark:text-gray-400">
              &ldquo;{word.example}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Status Selector */}
      {/* <div className="mb-6">
        <StatusSelector
          word={word}
          onStatusChange={handleStatusChange}
          updating={updating}
        />
      </div> */}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            ← Previous
          </button>
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Next →
          </button>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(word)}
            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            Delete Word
          </button>
        )}
      </div>
    </div>
  );
}

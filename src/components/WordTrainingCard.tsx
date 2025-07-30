import { Word } from "../entities/word";

import ReloadButton from "./shared/ReloadButton";
import StatusSelector from "./shared/StatusSelector";
import WordDisplay from "./shared/WordDisplay";

export default function WordTrainingCard({
  word,
  onReloadDefinition,
  onReloadTranslation,
  onStatusChange,
  updating,
  current,
  total,
  onPrev,
  onNext,
}: {
  word: Word;
  onReloadDefinition: (word: Word) => void;
  onReloadTranslation: (word: Word) => void;
  onStatusChange: (id: string, status: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  updating?: string | null;
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="relative mx-auto mb-6 flex w-full max-w-2xl flex-col items-center rounded-xl bg-white p-4 shadow-md sm:p-8 dark:bg-gray-800">
      <div className="absolute top-2 right-4 text-xs text-gray-400 dark:text-gray-500">
        {current + 1} / {total}
      </div>

      <div className="mb-6 flex items-center space-x-3">
        <WordDisplay word={word} showLink={false} size="lg" />
      </div>

      <div className="w-full space-y-6">
        {/* Definition Section */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 sm:text-base dark:text-gray-300">
              Definition:
            </span>
            <ReloadButton
              onClick={() => onReloadDefinition(word)}
              disabled={updating === word.id}
            />
          </div>
          <div className="text-sm leading-relaxed text-gray-800 sm:text-lg dark:text-gray-200">
            {word.definition || (
              <span className="text-gray-400 dark:text-gray-500">(none)</span>
            )}
          </div>
          {/* Synonyms/Antonyms */}
          {(() => {
            const synonyms =
              word.details?.meanings?.[0]?.definitions?.[0]?.synonyms ?? [];
            const antonyms =
              word.details?.meanings?.[0]?.definitions?.[0]?.antonyms ?? [];
            return (
              <>
                {synonyms.length > 0 && (
                  <div className="mt-2">
                    <span className="mr-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      Synonyms:
                    </span>
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {synonyms.join(", ")}
                    </span>
                  </div>
                )}
                {antonyms.length > 0 && (
                  <div className="mt-1">
                    <span className="mr-2 text-xs font-semibold text-pink-600 dark:text-pink-400">
                      Antonyms:
                    </span>
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {antonyms.join(", ")}
                    </span>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Translation Section */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-green-700 sm:text-base dark:text-green-400">
              Translation:
            </span>
            <ReloadButton
              onClick={() => onReloadTranslation(word)}
              disabled={updating === word.id}
            />
          </div>
          <div className="text-sm text-green-700 sm:text-lg dark:text-green-400">
            {word.translation || (
              <span className="text-gray-400 dark:text-gray-500">(none)</span>
            )}
          </div>
        </div>

        {/* Status Section */}
        <StatusSelector
          status={word.status}
          onStatusChange={(status) => onStatusChange(word.id, status)}
          updating={updating === word.id}
          className="mb-6"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex w-full justify-between gap-4">
        <button
          onClick={onPrev}
          disabled={current === 0}
          className="flex-1 rounded bg-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-300 disabled:opacity-50 sm:text-base dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={current === total - 1}
          className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50 sm:text-base dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Next
        </button>
      </div>
    </div>
  );
}

import type { Word } from "@/types";
import WordDisplay from "./shared/WordDisplay";
import StatusSelector from "./shared/StatusSelector";
import ReloadButton from "./shared/ReloadButton";

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
  onStatusChange: (id: string, status: string) => void;
  updating?: string | null;
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-8 w-full max-w-2xl mx-auto mb-6 relative flex flex-col items-center">
      <div className="absolute top-2 right-4 text-xs text-gray-400 dark:text-gray-500">
        {current + 1} / {total}
      </div>

      <div className="flex items-center space-x-3 mb-6">
        <WordDisplay word={word} showLink={false} size="lg" />
      </div>

      <div className="w-full space-y-6">
        {/* Definition Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              Definition:
            </span>
            <ReloadButton
              onClick={() => onReloadDefinition(word)}
              disabled={updating === word.id}
            />
          </div>
          <div className="text-gray-800 dark:text-gray-200 text-sm sm:text-lg leading-relaxed">
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
                    <span className="font-semibold text-blue-600 dark:text-blue-400 text-xs mr-2">
                      Synonyms:
                    </span>
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {synonyms.join(", ")}
                    </span>
                  </div>
                )}
                {antonyms.length > 0 && (
                  <div className="mt-1">
                    <span className="font-semibold text-pink-600 dark:text-pink-400 text-xs mr-2">
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
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-green-700 dark:text-green-400 text-sm sm:text-base">
              Translation:
            </span>
            <ReloadButton
              onClick={() => onReloadTranslation(word)}
              disabled={updating === word.id}
            />
          </div>
          <div className="text-green-700 dark:text-green-400 text-sm sm:text-lg">
            {word.translation || (
              <span className="text-gray-400 dark:text-gray-500">(none)</span>
            )}
          </div>
        </div>

        {/* Status Section */}
        <StatusSelector
          word={word}
          onStatusChange={onStatusChange}
          updating={updating}
          className="mb-6"
          buttonClassName="px-4 py-2"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between w-full mt-6 gap-4">
        <button
          onClick={onPrev}
          disabled={current === 0}
          className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded disabled:opacity-50 transition-colors text-sm sm:text-base"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={current === total - 1}
          className="flex-1 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 transition-colors text-sm sm:text-base"
        >
          Next
        </button>
      </div>
    </div>
  );
}

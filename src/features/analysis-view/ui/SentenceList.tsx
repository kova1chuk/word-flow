import type { Sentence } from "@/entities/analysis/types";

interface SentenceListProps {
  sentences: Sentence[];
  viewMode: "list" | "columns";
  isFullScreen: boolean;
  translatedSentences: Record<string, string>;
  translatingSentenceId: string | null;
  onWordClick: (word: string) => void;
  onTranslate: (sentenceId: string, text: string) => void;
  loading?: boolean;
}

export const SentenceList: React.FC<SentenceListProps> = ({
  sentences,
  viewMode,
  isFullScreen,
  translatedSentences,
  translatingSentenceId,
  onWordClick,
  onTranslate,
  loading = false,
}) => {
  console.log("🔍 SentenceList render:", {
    sentenceCount: sentences.length,
    sentenceIds: sentences.map((s) => s.id),
    translatedSentences,
    translatingSentenceId,
  });
  // Highlight words in text and make them clickable
  const renderClickableText = (text: string, sentenceId: string) => {
    const words = text.split(/(\s+)/);
    return words.map((word, index) => {
      const cleanWord = word.replace(/[^\w]/g, "");
      const uniqueKey = `${sentenceId}-word-${index}`;

      if (cleanWord.length > 2) {
        return (
          <span key={uniqueKey}>
            <button
              onClick={() => onWordClick(cleanWord.toLowerCase())}
              className="rounded px-1 font-medium transition-all duration-200 hover:bg-yellow-200 hover:text-gray-900 dark:hover:bg-yellow-800 dark:hover:text-yellow-100"
              title={`Click to see info about "${cleanWord}"`}
            >
              {word}
            </button>
          </span>
        );
      }
      return <span key={uniqueKey}>{word}</span>;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-start border-b border-gray-100 p-4 last:border-b-0 dark:border-gray-700"
          >
            {/* Content Skeleton */}
            <div className="flex-1 space-y-3">
              {/* Sentence Text Skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Translation Skeleton */}
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sentences.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            No sentences found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        isFullScreen
          ? "flex-1 overflow-y-auto"
          : "max-h-[600px] overflow-y-auto"
      }`}
    >
      <div className="space-y-0">
        {sentences.map((sentence) => {
          const translation = translatedSentences[sentence.id];
          const isTranslating = translatingSentenceId === sentence.id;

          return (
            <div
              key={sentence.id}
              className="border-b border-gray-100 px-6 py-4 transition-colors duration-200 last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
            >
              <div className="flex items-start">
                {/* Content */}
                <div className="min-w-0 flex-1">
                  {viewMode === "columns" && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Original Text */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                            />
                          </svg>
                          <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                            Original
                          </span>
                        </div>
                        <p className="text-lg leading-relaxed text-gray-900 dark:text-gray-100">
                          {renderClickableText(sentence.text, sentence.id)}
                        </p>
                      </div>

                      {/* Translation */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                            />
                          </svg>
                          <span className="text-xs font-medium tracking-wide text-blue-500 uppercase dark:text-blue-400">
                            Translation
                          </span>
                        </div>
                        {translation ? (
                          <p className="text-lg leading-relaxed text-blue-600 dark:text-blue-400">
                            {translation}
                          </p>
                        ) : (
                          <button
                            onClick={() =>
                              onTranslate(sentence.id, sentence.text)
                            }
                            disabled={isTranslating}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-600 transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                          >
                            {isTranslating ? (
                              <>
                                <svg
                                  className="h-4 w-4 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Translating...
                              </>
                            ) : (
                              <>
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                                  />
                                </svg>
                                Translate
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {viewMode === "list" && (
                    <div className="space-y-4">
                      {/* Original Text */}
                      <div>
                        <p className="text-lg leading-relaxed text-gray-900 dark:text-gray-100">
                          {renderClickableText(sentence.text, sentence.id)}
                        </p>
                      </div>

                      {/* Translation */}
                      {translation && (
                        <div className="rounded-r-lg border-l-4 border-blue-500 bg-blue-50 p-4 pl-4 dark:bg-blue-900/20">
                          <p className="text-base leading-relaxed text-blue-600 dark:text-blue-400">
                            {translation}
                          </p>
                        </div>
                      )}

                      {/* Translate Button */}
                      {!translation && (
                        <div className="pl-4">
                          <button
                            onClick={() =>
                              onTranslate(sentence.id, sentence.text)
                            }
                            disabled={isTranslating}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-600 transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                          >
                            {isTranslating ? (
                              <>
                                <svg
                                  className="h-4 w-4 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Translating...
                              </>
                            ) : (
                              <>
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                                  />
                                </svg>
                                Translate
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
  const renderClickableText = (text: string) => {
    const words = text.split(/(\s+)/);
    return words.map((word, index) => {
      const cleanWord = word.replace(/[^\w]/g, "");
      if (cleanWord.length > 2) {
        return (
          <span key={index}>
            <button
              onClick={() => onWordClick(cleanWord.toLowerCase())}
              className="hover:bg-yellow-200 dark:hover:bg-yellow-800 hover:text-gray-900 dark:hover:text-yellow-100 px-1 rounded transition-all duration-200 font-medium"
              title={`Click to see info about "${cleanWord}"`}
            >
              {word}
            </button>
          </span>
        );
      }
      return <span key={index}>{word}</span>;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-start p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
          >
            {/* Content Skeleton */}
            <div className="flex-1 space-y-3">
              {/* Sentence Text Skeleton */}
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>

              {/* Translation Skeleton */}
              <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
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
            className="w-12 h-12 text-gray-400 mx-auto mb-4"
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
          <p className="text-gray-500 dark:text-gray-400 text-lg">
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
              className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
            >
              <div className="flex items-start">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {viewMode === "columns" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Original Text */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-400"
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
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Original
                          </span>
                        </div>
                        <p className="text-gray-900 dark:text-gray-100 text-lg leading-relaxed">
                          {renderClickableText(sentence.text)}
                        </p>
                      </div>

                      {/* Translation */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-blue-400"
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
                          <span className="text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-wide">
                            Translation
                          </span>
                        </div>
                        {translation ? (
                          <p className="text-blue-600 dark:text-blue-400 text-lg leading-relaxed">
                            {translation}
                          </p>
                        ) : (
                          <button
                            onClick={() =>
                              onTranslate(sentence.id, sentence.text)
                            }
                            disabled={isTranslating}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isTranslating ? (
                              <>
                                <svg
                                  className="animate-spin w-4 h-4"
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
                                  className="w-4 h-4"
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
                        <p className="text-gray-900 dark:text-gray-100 text-lg leading-relaxed">
                          {renderClickableText(sentence.text)}
                        </p>
                      </div>

                      {/* Translation */}
                      {translation && (
                        <div className="pl-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg p-4">
                          <p className="text-blue-600 dark:text-blue-400 text-base leading-relaxed">
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
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isTranslating ? (
                              <>
                                <svg
                                  className="animate-spin w-4 h-4"
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
                                  className="w-4 h-4"
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

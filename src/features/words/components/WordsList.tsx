import WordCard from "@/components/WordCard";

import type { Word, WordDetails } from "@/types";

interface WordsListProps {
  words: Word[];
  onReloadDefinition: (
    word: Word,
  ) => Promise<{ definition: string; details?: WordDetails }>;
  onReloadTranslation: (word: Word) => Promise<{ translation: string }>;
  onDelete: (word: Word) => Promise<boolean>;
  onStatusChange: (
    id: string,
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  ) => Promise<{ status: number }>;
  updating: string | null;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  filteredWords: Word[];
  goToPage: (page: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
}

export default function WordsList({
  words,
  onReloadDefinition,
  onReloadTranslation,
  onDelete,
  onStatusChange,
  updating,
  currentPage,
  totalPages,
  pageSize,
  filteredWords,
  goToPage,
  goToPreviousPage,
  goToNextPage,
}: WordsListProps) {
  if (filteredWords.length === 0) {
    return (
      <div className="py-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No words found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by adding your first word.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {words.map((word) => (
          <WordCard
            key={word.id}
            word={word}
            onReloadDefinition={async (word) => {
              await onReloadDefinition(word);
            }}
            onReloadTranslation={async (word) => {
              await onReloadTranslation(word);
            }}
            onDelete={async (word) => {
              await onDelete(word);
            }}
            onStatusChange={async (id, status) => {
              await onStatusChange(id, status);
            }}
            updating={updating}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredWords.length)} of{" "}
              {filteredWords.length} words
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}

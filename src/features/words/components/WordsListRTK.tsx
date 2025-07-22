import React, { useMemo } from "react";

import { useSelector } from "react-redux";

import WordCard from "@/components/WordCard";

import { selectPaginatedWords } from "@/features/words/model/selectors";

import { RootState } from "@/shared/model/store";

import type { Word } from "@/types";

interface WordsListRTKProps {
  currentPage: number;
  pageSize: number;
  onWordAction: (action: string, word: Word, data?: unknown) => void;
}

const WordsListRTK: React.FC<WordsListRTKProps> = ({
  currentPage,
  pageSize,
  onWordAction,
}) => {
  const { loading, error, updating } = useSelector(
    (state: RootState) => state.words,
  );

  // Use the selector for paginated words
  const paginationOptions = useMemo(
    () => ({ page: currentPage, pageSize }),
    [currentPage, pageSize],
  );
  const { words: paginatedWords } = useSelector((state: RootState) =>
    selectPaginatedWords(state, paginationOptions),
  );

  // Throw a promise when loading to trigger Suspense
  if (loading) {
    throw new Promise(() => {
      // This promise will never resolve, but Suspense will catch it
      // and show the fallback until the loading state changes
    });
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-red-500">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (paginatedWords.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">No words found for this page.</p>
      </div>
    );
  }

  const handleReloadDefinition = async (word: Word) => {
    onWordAction("reload-definition", word);
  };

  const handleReloadTranslation = async (word: Word) => {
    onWordAction("reload-translation", word);
  };

  const handleDelete = async (word: Word) => {
    onWordAction("delete", word);
  };

  const handleStatusChange = async (
    id: string,
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  ) => {
    const word = paginatedWords.find((w) => w.id === id);
    if (word) {
      onWordAction("update-status", word, status);
    }
  };

  console.log("paginatedWords", paginatedWords);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {paginatedWords.map((word) => (
        <WordCard
          key={word.id}
          word={word}
          onReloadDefinition={handleReloadDefinition}
          onReloadTranslation={handleReloadTranslation}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          updating={updating}
        />
      ))}
    </div>
  );
};

export default WordsListRTK;

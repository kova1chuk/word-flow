import React from "react";

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

export const WordsListRTK: React.FC<WordsListRTKProps> = ({
  currentPage,
  pageSize,
  onWordAction,
}) => {
  const { loading, error, updating } = useSelector(
    (state: RootState) => state.words
  );

  // Use the new selector for paginated words
  const { words: paginatedWords } = useSelector((state: RootState) =>
    selectPaginatedWords(state, { page: currentPage, pageSize })
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
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (paginatedWords.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No words found for this page.</p>
      </div>
    );
  }

  const handleReloadDefinition = (word: Word) => {
    onWordAction("reload-definition", word);
  };

  const handleReloadTranslation = (word: Word) => {
    onWordAction("reload-translation", word);
  };

  const handleDelete = (word: Word) => {
    onWordAction("delete", word);
  };

  const handleStatusChange = (
    id: string,
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7
  ) => {
    const word = paginatedWords.find((w) => w.id === id);
    if (word) {
      onWordAction("update-status", word, status);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

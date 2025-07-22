import React from "react";

import StatusSelector from "./shared/StatusSelector";
import WordDisplay from "./shared/WordDisplay";

import type { Word } from "@/types";

interface WordCardProps {
  word: Word;
  onReloadDefinition: (word: Word) => Promise<void>;
  onReloadTranslation: (word: Word) => Promise<void>;
  onDelete: (word: Word) => Promise<void>;
  onStatusChange: (
    wordId: string,
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  ) => Promise<void>;
  updating: string | null;
}

const WordCard: React.FC<WordCardProps> = ({
  word,
  onStatusChange,
  updating,
}) => {
  const handleStatusChange = async (
    id: string,
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  ) => {
    await onStatusChange(id, status);
  };

  if (!word) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
      <WordDisplay word={word} />

      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-600">
        <StatusSelector
          word={word}
          onStatusChange={handleStatusChange}
          updating={updating}
        />
      </div>
    </div>
  );
};

export default WordCard;

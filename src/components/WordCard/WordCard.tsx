import { memo } from "react";

import { useSelector } from "react-redux";

import { selectWordById } from "@/features/dictionary/model/selectors";

import { RootState } from "../../shared/model/store";

import StatusSelector from "../shared/StatusSelector";
import WordDisplay from "../shared/WordDisplay";

import WordCardDeleteButton from "./WordCardDeleteButton";
import WordCardInfo from "./WordCardInfo";

import type { WordStatus } from "@/types";

interface WordCardProps {
  wordId: string;
  currentPage: number;
  onReloadDefinition: (id: string, wordText: string) => void;
  onReloadTranslation: (id: string, wordText: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange: (id: string, status: WordStatus) => void;
}

const WordCard = memo(function WordCard({
  wordId,
  currentPage,
  onReloadDefinition,
  onReloadTranslation,
  onDelete,
  onStatusChange,
}: WordCardProps) {
  const word = useSelector((state: RootState) =>
    selectWordById(state, { id: wordId, page: currentPage }),
  );

  if (!word) {
    return null;
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(wordId);
    }
  };
  const handleReloadDefinition = () => {
    onReloadDefinition(wordId, word.word);
  };
  const handleReloadTranslation = () => {
    onReloadTranslation(wordId, word.word);
  };
  const handleStatusChange = (status: WordStatus) => {
    onStatusChange(wordId, status);
  };

  return (
    <div className="relative mx-auto mb-6 w-full rounded-xl bg-white p-4 shadow-md sm:p-6 dark:bg-gray-800">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <WordDisplay word={word} size="md" />
        </div>
        <WordCardDeleteButton
          onDelete={handleDelete}
          loading={word.updatingWordDelete}
        />
      </div>

      <div className="space-y-4">
        <WordCardInfo
          type="definition"
          infoText={word.definition}
          onReload={handleReloadDefinition}
          updating={word.updatingWordDefinition}
        />

        <WordCardInfo
          type="translation"
          infoText={word.translation}
          onReload={handleReloadTranslation}
          updating={word.updatingWordTranslation}
        />

        <StatusSelector
          status={word.status}
          onStatusChange={handleStatusChange}
          updating={word.updatingWordStatus}
        />
      </div>
    </div>
  );
});

export default WordCard;

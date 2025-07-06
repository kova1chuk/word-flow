import { AnalysisWord } from "../lib/useAnalysisWords";
import WordCard from "@/components/WordCard";

interface WordListProps {
  words: AnalysisWord[];
  onStatusChange: (id: string, status: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  onReloadDefinition: (word: AnalysisWord) => void;
  onReloadTranslation: (word: AnalysisWord) => void;
  updating?: string | null;
}

export function WordList({
  words,
  onStatusChange,
  onReloadDefinition,
  onReloadTranslation,
  updating,
}: WordListProps) {
  return (
    <div>
      {words.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No words found with the selected filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {words.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              onStatusChange={onStatusChange}
              onReloadDefinition={onReloadDefinition}
              onReloadTranslation={onReloadTranslation}
              updating={updating}
            />
          ))}
        </div>
      )}
    </div>
  );
}

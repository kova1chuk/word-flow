import { AnalysisWord } from "../lib/useAnalysisWords";
import WordCard from "@/components/WordCard";
import { Timestamp } from "firebase/firestore";

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
              word={{
                ...word,
                definition: word.definition ?? "",
                status: (word.status ?? 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
                createdAt: word.createdAt ?? new Timestamp(0, 0),
              }}
              onStatusChange={
                onStatusChange as (
                  id: string,
                  status: 1 | 2 | 3 | 4 | 5 | 6 | 7
                ) => void
              }
              onReloadDefinition={(w) => onReloadDefinition(w as AnalysisWord)}
              onReloadTranslation={(w) =>
                onReloadTranslation(w as AnalysisWord)
              }
              updating={updating}
            />
          ))}
        </div>
      )}
    </div>
  );
}

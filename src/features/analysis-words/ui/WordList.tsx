import WordCard from "@/components/WordCard";

import { AnalysisWord } from "../lib/useAnalysisWords";

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
        <div className="py-12 text-center">
          <p className="text-gray-500">
            No words found with the selected filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {words.map((word) => (
            <WordCard
              key={word.id}
              word={{
                ...word,
                definition: word.definition ?? "",
                status: (word.status ?? 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
                createdAt: new Date().toISOString(), // Default to now since AnalysisWord doesn't have createdAt
                updatedAt: new Date().toISOString(), // Default to now since AnalysisWord doesn't have updatedAt
                userId: "", // AnalysisWord doesn't have userId, provide empty string
              }}
              onStatusChange={async (wordId, status) => {
                onStatusChange(wordId, status);
              }}
              onReloadDefinition={async () => {
                onReloadDefinition(word);
              }}
              onReloadTranslation={async () => {
                onReloadTranslation(word);
              }}
              onDelete={async () => {}} // TODO: Implement delete functionality
              updating={updating ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

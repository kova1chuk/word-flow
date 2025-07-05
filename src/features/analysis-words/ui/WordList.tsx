import { useState } from "react";
import { AnalysisWord } from "../lib/useAnalysisWords";

interface WordListProps {
  words: AnalysisWord[];
}

export function WordList({ words }: WordListProps) {
  const [selectedWord, setSelectedWord] = useState<AnalysisWord | null>(null);
  const [filter, setFilter] = useState<"all" | "learned" | "notLearned">("all");

  const filteredWords = words.filter((word) => {
    switch (filter) {
      case "learned":
        return word.isLearned;
      case "notLearned":
        return !word.isLearned;
      default:
        return true;
    }
  });

  const handleWordClick = (word: AnalysisWord) => {
    setSelectedWord(selectedWord?.id === word.id ? null : word);
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All ({words.length})
        </button>
        <button
          onClick={() => setFilter("learned")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filter === "learned"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Learned ({words.filter((w) => w.isLearned).length})
        </button>
        <button
          onClick={() => setFilter("notLearned")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filter === "notLearned"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Not Learned ({words.filter((w) => !w.isLearned).length})
        </button>
      </div>

      {/* Words List */}
      <div className="space-y-4">
        {filteredWords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No words found with the selected filter.
            </p>
          </div>
        ) : (
          filteredWords.map((word) => (
            <div
              key={word.id}
              className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleWordClick(word)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {word.word}
                </h3>
                <div className="flex gap-2">
                  {word.isLearned && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Learned
                    </span>
                  )}
                </div>
              </div>

              {/* Word Details (shown when expanded) */}
              {selectedWord?.id === word.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  {word.definition && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Definition:
                      </h4>
                      <p className="text-gray-600">{word.definition}</p>
                    </div>
                  )}
                  {word.translation && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Translation:
                      </h4>
                      <p className="text-gray-600">{word.translation}</p>
                    </div>
                  )}
                  {word.usages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Usages ({word.usages.length}):
                      </h4>
                      <div className="space-y-2">
                        {word.usages.map((usage, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 p-3 rounded text-sm text-gray-700"
                          >
                            {usage}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

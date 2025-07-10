import React, { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collectionGroup,
  query,
  getDocs,
  limit,
  getDoc,
} from "firebase/firestore";
import type { Word } from "@/types";
import WordDisplay from "./shared/WordDisplay";
import StatusSelector from "./shared/StatusSelector";
import ReloadButton from "./shared/ReloadButton";

interface Sentence {
  id: string;
  text: string;
  analysisTitle: string;
}

export default function WordCard({
  word,
  onReloadDefinition,
  onReloadTranslation,
  onDelete,
  onStatusChange,
  updating,
}: {
  word: Word;
  onReloadDefinition: (word: Word) => void;
  onReloadTranslation: (word: Word) => void;
  onDelete?: (word: Word) => void;
  onStatusChange: (id: string, status: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  updating?: string | null;
}) {
  const [examples, setExamples] = useState<Sentence[]>([]);
  const [loadingExamples, setLoadingExamples] = useState(false);

  const fetchExamples = useCallback(async () => {
    try {
      setLoadingExamples(true);
      console.log(`Fetching examples for word: "${word.word}"`);

      // Get sentences containing this word (without orderBy to avoid index requirement)
      const sentencesQuery = query(
        collectionGroup(db, "sentences"),
        limit(100) // Get more sentences to find examples
      );

      const querySnapshot = await getDocs(sentencesQuery);
      console.log(
        `Found ${querySnapshot.docs.length} total sentences to search through`
      );
      const allSentences: Sentence[] = [];

      // Process sentences and find those containing the word
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const sentenceText = data.text.toLowerCase();
        const wordLower = word.word.toLowerCase();

        // Check if sentence contains the word (more flexible search)
        if (sentenceText.includes(wordLower)) {
          console.log(
            `Found matching sentence: "${data.text.substring(0, 50)}..."`
          );

          // Get the analysis title
          const analysisRef = doc.ref.parent.parent;
          let analysisTitle = "Unknown Analysis";
          if (analysisRef) {
            try {
              const analysisDoc = await getDoc(analysisRef);
              if (analysisDoc.exists()) {
                analysisTitle = analysisDoc.data().title || "Unknown Analysis";
              }
            } catch (error) {
              console.error("Error getting analysis title:", error);
            }
          }

          allSentences.push({
            id: doc.id,
            text: data.text,
            analysisTitle: analysisTitle,
          });
        }
      }

      console.log(
        `Found ${allSentences.length} examples for word "${word.word}"`
      );
      // Sort by analysis title and take first 2 examples
      const sortedSentences = allSentences.sort((a, b) =>
        a.analysisTitle.localeCompare(b.analysisTitle)
      );
      setExamples(sortedSentences.slice(0, 2));
    } catch (error) {
      console.error("Error fetching examples:", error);
    } finally {
      setLoadingExamples(false);
    }
  }, [word.word]);

  useEffect(() => {
    fetchExamples();
  }, [fetchExamples]);

  const highlightWord = (text: string, word: string) => {
    // Create a more flexible regex that handles word boundaries and different cases
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedWord})`, "gi");
    return text.replace(
      regex,
      (match) => `<mark class="bg-yellow-200 px-1 rounded">${match}</mark>`
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 w-full max-w-2xl mx-auto mb-6 relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <WordDisplay word={word} size="md" />
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(word)}
            className="absolute top-2 right-2 p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
            title="Delete word"
          >
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Definition Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              Definition:
            </span>
            <ReloadButton
              onClick={() => onReloadDefinition(word)}
              disabled={updating === word.id}
            />
          </div>
          <div className="text-gray-800 dark:text-gray-200 text-sm sm:text-base leading-relaxed">
            {word.definition || (
              <span className="text-gray-400 dark:text-gray-500">(none)</span>
            )}
          </div>
        </div>

        {/* Translation Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-green-700 dark:text-green-400 text-sm sm:text-base">
              Translation:
            </span>
            <ReloadButton
              onClick={() => onReloadTranslation(word)}
              disabled={updating === word.id}
            />
          </div>
          <div className="text-green-700 dark:text-green-400 text-sm sm:text-base">
            {word.translation || (
              <span className="text-gray-400 dark:text-gray-500">(none)</span>
            )}
          </div>
        </div>

        {/* Status Section */}
        <StatusSelector
          word={word}
          onStatusChange={onStatusChange}
          updating={updating}
        />

        {/* Examples Section */}
        {examples.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-2">
              Examples:
            </h4>
            <div className="space-y-3">
              {examples.map((example) => (
                <div
                  key={example.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    From: {example.analysisTitle}
                  </div>
                  <div
                    className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: highlightWord(example.text, word.word),
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {loadingExamples && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Loading examples...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

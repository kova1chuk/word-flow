import React, { useState, useEffect } from "react";
import type { Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  collectionGroup,
  query,
  getDocs,
  limit,
  getDoc,
} from "firebase/firestore";
import Link from "next/link";

const STATUS_OPTIONS = [
  {
    value: "well_known",
    label: "Well known",
    color: "bg-green-500 text-white border-green-500",
  },
  {
    value: "want_repeat",
    label: "Want repeat",
    color: "bg-orange-400 text-white border-orange-400",
  },
  {
    value: "to_learn",
    label: "To learn",
    color: "bg-blue-600 text-white border-blue-600",
  },
];

type Word = {
  id: string;
  word: string;
  definition: string;
  translation?: string;
  status?: string;
  createdAt: Timestamp;
  example?: string;
};

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
  onStatusChange: (id: string, status: string) => void;
  updating?: string | null;
}) {
  const [examples, setExamples] = useState<Sentence[]>([]);
  const [loadingExamples, setLoadingExamples] = useState(false);

  useEffect(() => {
    fetchExamples();
  }, [word.word]);

  const fetchExamples = async () => {
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
  };

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
    <div className="bg-white rounded-xl shadow-md p-6 max-w-lg mx-auto mb-6 relative">
      <div className="flex justify-between items-start mb-2">
        <Link
          href={`/words/${word.word}`}
          className="text-2xl font-bold text-blue-700 hover:text-blue-900 transition-colors"
          style={{ letterSpacing: 1 }}
        >
          {word.word}
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(word)}
            className="text-red-500 hover:underline text-base font-medium"
          >
            Delete
          </button>
        )}
      </div>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-700">Definition:</span>
          <button
            onClick={() => onReloadDefinition(word)}
            disabled={updating === word.id}
            className="text-blue-600 hover:text-blue-800 text-xs border border-blue-200 rounded px-2 py-1 ml-1 disabled:opacity-50"
            title="Reload definition"
          >
            Reload
          </button>
        </div>
        <div className="text-gray-800 text-base">
          {word.definition || <span className="text-gray-400">(none)</span>}
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-green-700">Translation:</span>
          <button
            onClick={() => onReloadTranslation(word)}
            disabled={updating === word.id}
            className="text-blue-600 hover:text-blue-800 text-xs border border-blue-200 rounded px-2 py-1 ml-1 disabled:opacity-50"
            title="Reload translation"
          >
            Reload
          </button>
        </div>
        <div className="text-green-700 text-base">
          {word.translation || <span className="text-gray-400">(none)</span>}
        </div>
      </div>

      {/* Examples Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-700">Examples:</span>
          <Link
            href={`/words/${word.word}`}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
          >
            View all examples →
          </Link>
        </div>
        {loadingExamples ? (
          <div className="text-sm text-gray-500">Loading examples...</div>
        ) : examples.length === 0 ? (
          <div className="text-sm text-gray-500">No examples found</div>
        ) : (
          <div className="space-y-2">
            {examples.map((example, index) => (
              <div key={example.id} className="text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs text-gray-500">
                    Example {index + 1}
                  </span>
                  <span className="text-xs text-blue-600">
                    {example.analysisTitle}
                  </span>
                </div>
                <p
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: highlightWord(example.text, word.word),
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <span className="font-semibold text-gray-700">Status:</span>
        <div className="flex gap-2 mt-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onStatusChange(word.id, opt.value)}
              disabled={updating === word.id || word.status === opt.value}
              className={`px-4 py-2 rounded font-medium border transition-colors text-sm
                ${
                  word.status === opt.value
                    ? opt.color
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }
                disabled:opacity-60`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-2">
        Added:{" "}
        {word.createdAt?.toDate
          ? word.createdAt.toDate().toLocaleDateString()
          : ""}
      </div>
    </div>
  );
}

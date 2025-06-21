"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  collectionGroup,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Sentence {
  id: string;
  text: string;
  index: number;
  wordCount?: number;
  chapter?: string;
  hasUnknownWords?: boolean;
  analysisId: string;
  analysisTitle: string;
}

interface Word {
  id: string;
  word: string;
  definition: string;
  translation?: string;
  status?: string;
  createdAt: Timestamp;
}

export default function WordPage() {
  const { user } = useAuth();
  const params = useParams();
  const wordParam = params.word as string;

  const [word, setWord] = useState<Word | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSentences, setLoadingSentences] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && wordParam) {
      fetchWord();
      fetchWordExamples();
    }
  }, [user, wordParam]);

  const fetchWord = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const wordsRef = collection(db, "words");
      const q = query(
        wordsRef,
        where("userId", "==", user.uid),
        where("word", "==", wordParam.toLowerCase())
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setWord({
          id: doc.id,
          ...doc.data(),
        } as Word);
      } else {
        setError("Word not found in your collection");
      }
    } catch (error) {
      console.error("Error fetching word:", error);
      setError("Failed to load word information");
    } finally {
      setLoading(false);
    }
  };

  const fetchWordExamples = async () => {
    if (!user) return;

    try {
      setLoadingSentences(true);

      // Get all sentences from all analyses
      const sentencesQuery = query(
        collectionGroup(db, "sentences"),
        limit(1000) // Get more sentences to find examples
      );

      const querySnapshot = await getDocs(sentencesQuery);
      const allSentences: Sentence[] = [];

      // Process sentences and find those containing the word
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const sentenceText = data.text.toLowerCase();
        const wordLower = wordParam.toLowerCase();

        // Check if sentence contains the word (more flexible search)
        if (sentenceText.includes(wordLower)) {
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
            index: data.index,
            wordCount: data.wordCount,
            chapter: data.chapter,
            hasUnknownWords: data.hasUnknownWords,
            analysisId: doc.ref.parent.parent?.id || "",
            analysisTitle: analysisTitle,
          });
        }
      }

      // Sort by analysis title and limit to 20 examples
      const sortedSentences = allSentences
        .sort((a, b) => a.analysisTitle.localeCompare(b.analysisTitle))
        .slice(0, 20);

      setSentences(sortedSentences);
    } catch (error) {
      console.error("Error fetching word examples:", error);
      setError("Failed to load word examples");
    } finally {
      setLoadingSentences(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  if (error && !word) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Word Not Found
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/words"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Back to My Words
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/words"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block"
              >
                ← Back to My Words
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {word?.word}
              </h1>
              {word && (
                <div className="text-gray-600 space-y-1">
                  <p>
                    <strong>Definition:</strong> {word.definition}
                  </p>
                  {word.translation && (
                    <p>
                      <strong>Translation:</strong> {word.translation}
                    </p>
                  )}
                  <p>
                    <strong>Status:</strong> {word.status || "unset"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Word Examples */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Examples ({sentences.length})
          </h2>

          {loadingSentences ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : sentences.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No examples found for this word in your saved analyses.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Try analyzing some text that contains this word.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sentences.map((sentence, index) => (
                <div
                  key={sentence.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500">
                      Example {index + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {sentence.wordCount} words
                      </span>
                      <span className="text-xs text-blue-600">
                        {sentence.analysisTitle}
                      </span>
                    </div>
                  </div>
                  <p
                    className="text-gray-900 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: highlightWord(sentence.text, wordParam),
                    }}
                  />
                  {sentence.chapter && sentence.chapter !== "Unknown" && (
                    <p className="text-xs text-blue-600 mt-2">
                      Chapter: {sentence.chapter}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
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
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { useParams } from "next/navigation";
import Link from "next/link";
import { config } from "@/lib/config";

// --- Data Interfaces ---
interface Phonetic {
  text: string;
  audio: string;
}

interface Meaning {
  partOfSpeech: string;
  definitions: {
    definition: string;
    example?: string;
    synonyms?: string[];
    antonyms?: string[];
  }[];
}

interface WordDetails {
  phonetics: Phonetic[];
  meanings: Meaning[];
}

interface DictionaryApiResponse {
  phonetics: { text: string; audio: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }[];
  }[];
}

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
  details?: WordDetails;
}

// --- Component ---
export default function WordPage() {
  const { user } = useAuth();
  const params = useParams();
  const wordParam = params.word as string;

  const [word, setWord] = useState<Word | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSentences, setLoadingSentences] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<"definition" | "translation" | null>(
    null
  );
  const [translatedSentences, setTranslatedSentences] = useState<
    Record<string, string>
  >({});
  const [translatingSentenceId, setTranslatingSentenceId] = useState<
    string | null
  >(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        setWord({ id: doc.id, ...doc.data() } as Word);
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

  const reloadDefinition = async () => {
    if (!word) return;
    setUpdating("definition");
    try {
      const res = await fetch(
        `${config.dictionaryApi}/${encodeURIComponent(word.word)}`
      );
      if (!res.ok)
        throw new Error(`API request failed with status ${res.status}`);

      const data: DictionaryApiResponse[] = await res.json();
      if (!data || data.length === 0)
        throw new Error("No definition found in API response");

      const firstResult = data[0];
      const newDefinition =
        firstResult.meanings?.[0]?.definitions?.[0]?.definition ??
        "No definition found.";
      const newDetails: WordDetails = {
        phonetics: (firstResult.phonetics || [])
          .map((p) => ({ text: p.text, audio: p.audio }))
          .filter((p): p is Phonetic => !!(p.text && p.audio)),
        meanings: (firstResult.meanings || []).map((m) => ({
          partOfSpeech: m.partOfSpeech,
          definitions: m.definitions,
        })),
      };

      const dataToUpdate = { definition: newDefinition, details: newDetails };

      // Remove undefined fields before sending to Firestore
      Object.keys(dataToUpdate).forEach(
        (key) =>
          dataToUpdate[key as keyof typeof dataToUpdate] === undefined &&
          delete dataToUpdate[key as keyof typeof dataToUpdate]
      );

      await updateDoc(doc(db, "words", word.id), dataToUpdate);
      setWord((prev) => (prev ? { ...prev, ...dataToUpdate } : null));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setUpdating(null);
    }
  };

  const reloadTranslation = async () => {
    if (!word) return;
    setUpdating("translation");
    try {
      const langPair = `en|uk`;
      const url = `${config.translationApi.baseUrl}?q=${encodeURIComponent(
        word.word
      )}&langpair=${langPair}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Translation API request failed");

      const data = await res.json();
      const newTranslation =
        data.responseData?.translatedText || "No translation found.";

      await updateDoc(doc(db, "words", word.id), {
        translation: newTranslation,
      });
      setWord((prev) =>
        prev ? { ...prev, translation: newTranslation } : null
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setUpdating(null);
    }
  };

  const translateSentence = async (sentenceId: string, text: string) => {
    setTranslatingSentenceId(sentenceId);
    try {
      const langPair = `en|uk`;
      const url = `${config.translationApi.baseUrl}?q=${encodeURIComponent(
        text
      )}&langpair=${langPair}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Translation failed");
      const data = await res.json();
      setTranslatedSentences((prev) => ({
        ...prev,
        [sentenceId]:
          data.responseData?.translatedText || "Translation not available",
      }));
    } catch (error) {
      console.error("Sentence translation error:", error);
      setTranslatedSentences((prev) => ({
        ...prev,
        [sentenceId]: "Translation failed",
      }));
    } finally {
      setTranslatingSentenceId(null);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
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
      <audio ref={audioRef} />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/words"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block"
          >
            ← Back to My Words
          </Link>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  {word?.word}
                </h1>
                {word?.details?.phonetics &&
                  word.details.phonetics.length > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-lg text-gray-600">
                        {word.details.phonetics[0].text}
                      </span>
                      <button
                        onClick={() =>
                          playAudio(word.details!.phonetics[0].audio)
                        }
                        title="Play pronunciation"
                      >
                        <svg
                          className="w-6 h-6 text-blue-500 hover:text-blue-700"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={reloadDefinition}
                  disabled={!!updating}
                  className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md disabled:opacity-50"
                >
                  {updating === "definition"
                    ? "Reloading..."
                    : "Reload Definition"}
                </button>
                <button
                  onClick={reloadTranslation}
                  disabled={!!updating}
                  className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md disabled:opacity-50"
                >
                  {updating === "translation"
                    ? "Reloading..."
                    : "Reload Translation"}
                </button>
              </div>
            </div>
            <div className="mt-4 text-gray-700 space-y-1">
              <p>
                <strong>Definition:</strong> {word?.definition}
              </p>
              {word?.translation && (
                <p>
                  <strong>Translation:</strong> {word.translation}
                </p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Definitions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Detailed Definitions
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {word?.details?.meanings.map((meaning, i) => (
              <div key={i}>
                <h3 className="text-xl font-semibold text-blue-700 italic">
                  {meaning.partOfSpeech}
                </h3>
                <ol className="list-decimal list-inside mt-2 space-y-4">
                  {meaning.definitions.map((def, j) => (
                    <li key={j} className="text-gray-800">
                      <p className="font-medium">{def.definition}</p>
                      {def.example && (
                        <p className="text-sm text-gray-600 mt-1 pl-4 border-l-2 border-gray-200">
                          <em>&quot;{def.example}&quot;</em>
                        </p>
                      )}
                      {def.synonyms && def.synonyms.length > 0 && (
                        <p className="text-sm mt-1">
                          <strong className="text-gray-600">Synonyms:</strong>{" "}
                          {def.synonyms.join(", ")}
                        </p>
                      )}
                      {def.antonyms && def.antonyms.length > 0 && (
                        <p className="text-sm mt-1">
                          <strong className="text-gray-600">Antonyms:</strong>{" "}
                          {def.antonyms.join(", ")}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* Word Examples */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Examples from your analyses ({sentences.length})
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
              {sentences.map((sentence) => (
                <div
                  key={sentence.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <p
                    className="text-gray-900 leading-relaxed mb-2"
                    dangerouslySetInnerHTML={{
                      __html: highlightWord(sentence.text, wordParam),
                    }}
                  />

                  {translatedSentences[sentence.id] ? (
                    <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded-md">
                      {translatedSentences[sentence.id]}
                    </p>
                  ) : (
                    <button
                      onClick={() =>
                        translateSentence(sentence.id, sentence.text)
                      }
                      disabled={translatingSentenceId === sentence.id}
                      className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                    >
                      {translatingSentenceId === sentence.id
                        ? "Translating..."
                        : "Translate"}
                    </button>
                  )}

                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>
                      From:{" "}
                      <span className="text-blue-600">
                        {sentence.analysisTitle}
                      </span>
                    </span>
                    <span>
                      {sentence.chapter && `Chapter: ${sentence.chapter}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

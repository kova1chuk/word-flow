"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

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
} from "firebase/firestore";

import { useSelector } from "react-redux";

import PageLoader from "@/components/PageLoader";

import { selectUser } from "@/entities/user/model/selectors";

import { config } from "@/lib/config";
import { db } from "@/lib/firebase";

import type { Word, WordDetails, Phonetic } from "@/types";

// --- Data Interfaces ---
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

interface DatamuseResult {
  word: string;
  score: number;
  tags?: string[];
  defs?: string[];
  numSyllables?: number;
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

// --- Component ---
export default function WordPage() {
  const user = useSelector(selectUser);
  const params = useParams();
  const wordParam = Array.isArray(params.word) ? params.word[0] : params.word;

  const [word, setWord] = useState<Word | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSentences, setLoadingSentences] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<"definition" | "translation" | null>(
    null
  );
  const [translatedSentences, setTranslatedSentences] = useState<
    Record<string, string>
  >({});
  const [translatingSentenceId, setTranslatingSentenceId] = useState<
    string | null
  >(null);
  const [datamuseSynonyms, setDatamuseSynonyms] = useState<DatamuseResult[]>(
    []
  );
  const [datamuseAntonyms, setDatamuseAntonyms] = useState<DatamuseResult[]>(
    []
  );
  const [datamuseRelated, setDatamuseRelated] = useState<DatamuseResult[]>([]);
  const [loadingDatamuse, setLoadingDatamuse] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchWord = useCallback(async () => {
    if (!user || !wordParam) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "words"),
        where("userId", "==", user.uid),
        where("word", "==", wordParam.toLowerCase())
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setWord({ id: doc.id, ...doc.data() } as Word);
      } else {
        setError("Word not found or you do not have permission to view it.");
      }
    } catch (err) {
      console.error("Error fetching word:", err);
      setError("Failed to load word data.");
    } finally {
      setLoading(false);
    }
  }, [user, wordParam]);

  const fetchWordExamples = useCallback(async () => {
    if (!word || !wordParam) return;
    setLoadingSentences(true);
    try {
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
  }, [word, wordParam]);

  useEffect(() => {
    if (user && wordParam) {
      fetchWord();
    }
  }, [user, wordParam, fetchWord]);

  useEffect(() => {
    if (word) {
      fetchWordExamples();
    }
  }, [word, fetchWordExamples]);

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

  const fetchDatamuseResults = async () => {
    if (!word?.word) return;
    setLoadingDatamuse(true);
    try {
      // Fetch synonyms, antonyms, and related words
      const [synonymsResponse, antonymsResponse, relatedResponse] =
        await Promise.all([
          fetch(
            `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(
              word.word
            )}&max=15&md=dpf`
          ),
          fetch(
            `https://api.datamuse.com/words?rel_ant=${encodeURIComponent(
              word.word
            )}&max=15&md=dpf`
          ),
          fetch(
            `https://api.datamuse.com/words?ml=${encodeURIComponent(
              word.word
            )}&max=15&md=dpf`
          ),
        ]);

      const synonyms = synonymsResponse.ok ? await synonymsResponse.json() : [];
      const antonyms = antonymsResponse.ok ? await antonymsResponse.json() : [];
      const related = relatedResponse.ok ? await relatedResponse.json() : [];

      const allResults = [...synonyms, ...antonyms, ...related];
      setDatamuseSynonyms(synonyms);
      setDatamuseAntonyms(antonyms);
      setDatamuseRelated(related);

      // Save to Firestore
      if (allResults.length > 0) {
        await updateDoc(doc(db, "words", word.id), {
          datamuseResults: allResults,
          datamuseSynonyms: synonyms,
          datamuseAntonyms: antonyms,
          datamuseRelated: related,
        });
      }
    } catch (error) {
      console.error("Error fetching Datamuse results:", error);
    } finally {
      setLoadingDatamuse(false);
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
    return <PageLoader text="Loading word details..." />;
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  if (error && !word) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg
                className="h-8 w-8 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Word Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            {error}
          </p>
          <Link
            href="/words"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to My Words
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <audio ref={audioRef} />
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/words"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mb-6 transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to My Words
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
                    {word?.word}
                  </h1>
                  {word?.details?.phonetics &&
                    word.details.phonetics.length > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-xl text-gray-600 dark:text-gray-400 font-mono">
                          {word.details.phonetics[0].text}
                        </span>
                        <button
                          onClick={() =>
                            playAudio(word.details!.phonetics[0].audio)
                          }
                          className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-full transition-colors duration-200"
                          title="Play pronunciation"
                        >
                          <svg
                            className="w-5 h-5 text-blue-600 dark:text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Definition
                    </h3>
                    <p className="text-lg text-gray-900 dark:text-white leading-relaxed">
                      {word?.definition}
                    </p>
                  </div>

                  {word?.translation && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
                        Translation
                      </h3>
                      <p className="text-lg text-blue-900 dark:text-blue-100 leading-relaxed">
                        {word.translation}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:flex-shrink-0">
                <button
                  onClick={reloadDefinition}
                  disabled={!!updating}
                  className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating === "definition" ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Reloading...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Reload Definition
                    </>
                  )}
                </button>

                <button
                  onClick={reloadTranslation}
                  disabled={!!updating}
                  className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating === "translation" ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Reloading...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        />
                      </svg>
                      Reload Translation
                    </>
                  )}
                </button>

                <button
                  onClick={fetchDatamuseResults}
                  disabled={loadingDatamuse}
                  className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingDatamuse ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Load Related Words
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Detailed Definitions */}
        {word?.details?.meanings && word.details.meanings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Detailed Definitions
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="space-y-8">
                {word.details.meanings.map((meaning, i) => (
                  <div
                    key={i}
                    className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-6 last:pb-0"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                        {meaning.partOfSpeech}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {meaning.definitions.map((def, j) => (
                        <div
                          key={j}
                          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
                        >
                          <p className="text-gray-900 dark:text-white font-medium leading-relaxed mb-2">
                            {j + 1}. {def.definition}
                          </p>

                          {def.example && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                              <p className="text-sm text-blue-800 dark:text-blue-200 italic">
                                &quot;{def.example}&quot;
                              </p>
                            </div>
                          )}

                          {def.synonyms && def.synonyms.length > 0 && (
                            <div className="mt-3">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Synonyms:
                              </span>{" "}
                              <span className="text-sm text-gray-800 dark:text-gray-200">
                                {def.synonyms.join(", ")}
                              </span>
                            </div>
                          )}

                          {def.antonyms && def.antonyms.length > 0 && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Antonyms:
                              </span>{" "}
                              <span className="text-sm text-gray-800 dark:text-gray-200">
                                {def.antonyms.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Data provided by Free Dictionary API
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Datamuse Results */}
        {(datamuseSynonyms.length > 0 ||
          datamuseAntonyms.length > 0 ||
          datamuseRelated.length > 0) && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Word Relationships
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              {/* Synonyms */}
              {datamuseSynonyms.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Synonyms ({datamuseSynonyms.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {datamuseSynonyms.map((result, index) => (
                      <div
                        key={index}
                        className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-green-800 dark:text-green-200">
                            {result.word}
                          </h4>
                          <span className="text-xs text-green-600 dark:text-green-400">
                            {result.score}
                          </span>
                        </div>
                        {result.tags && (
                          <div className="flex flex-wrap gap-1 mb-1">
                            {result.tags.slice(0, 2).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {result.defs && result.defs.length > 0 && (
                          <p className="text-xs text-green-700 dark:text-green-300 line-clamp-1">
                            {result.defs[0]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Antonyms */}
              {datamuseAntonyms.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Antonyms ({datamuseAntonyms.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {datamuseAntonyms.map((result, index) => (
                      <div
                        key={index}
                        className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-700 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-red-800 dark:text-red-200">
                            {result.word}
                          </h4>
                          <span className="text-xs text-red-600 dark:text-red-400">
                            {result.score}
                          </span>
                        </div>
                        {result.tags && (
                          <div className="flex flex-wrap gap-1 mb-1">
                            {result.tags.slice(0, 2).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {result.defs && result.defs.length > 0 && (
                          <p className="text-xs text-red-700 dark:text-red-300 line-clamp-1">
                            {result.defs[0]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Words */}
              {datamuseRelated.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    Related Words ({datamuseRelated.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {datamuseRelated.slice(0, 9).map((result, index) => (
                      <div
                        key={index}
                        className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                            {result.word}
                          </h4>
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            {result.score}
                          </span>
                        </div>
                        {result.tags && (
                          <div className="flex flex-wrap gap-1 mb-1">
                            {result.tags.slice(0, 2).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {result.defs && result.defs.length > 0 && (
                          <p className="text-xs text-blue-700 dark:text-blue-300 line-clamp-1">
                            {result.defs[0]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Data provided by Datamuse API
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Word Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Examples from your analyses
            </h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
              {sentences.length} examples
            </span>
          </div>

          {loadingSentences ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Loading examples...
                </span>
              </div>
            </div>
          ) : sentences.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No examples found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No examples found for this word in your saved analyses.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Try analyzing some text that contains this word.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sentences.map((sentence) => (
                <div
                  key={sentence.id}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200"
                >
                  <p
                    className="text-gray-900 dark:text-gray-100 leading-relaxed mb-4 text-lg"
                    dangerouslySetInnerHTML={{
                      __html: highlightWord(
                        sentence.text,
                        wordParam || (word ? word.word : "")
                      ),
                    }}
                  />

                  {translatedSentences[sentence.id] ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-400 mb-4">
                      <p className="text-blue-800 dark:text-blue-200 font-medium">
                        {translatedSentences[sentence.id]}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        translateSentence(sentence.id, sentence.text)
                      }
                      disabled={translatingSentenceId === sentence.id}
                      className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mb-4 disabled:opacity-50 transition-colors duration-200"
                    >
                      {translatingSentenceId === sentence.id ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Translating...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                            />
                          </svg>
                          Translate
                        </>
                      )}
                    </button>
                  )}

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        {sentence.analysisTitle}
                      </span>
                    </div>
                    {sentence.chapter && (
                      <div className="flex items-center gap-2">
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
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        <span>Chapter: {sentence.chapter}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

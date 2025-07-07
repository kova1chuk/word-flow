"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/entities/user/model/selectors";
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
} from "firebase/firestore";
import { useParams } from "next/navigation";
import Link from "next/link";
import { config } from "@/lib/config";
import type { Word, WordDetails, Phonetic } from "@/types";
import PageLoader from "@/components/PageLoader";

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

interface ApiResult {
  data?: unknown;
  error?: string;
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
  const [apiResults, setApiResults] = useState<{
    freeDictionary: ApiResult;
    datamuse: ApiResult;
    oxford: ApiResult;
    linguaRobot: ApiResult;
    wordnik: ApiResult;
  }>({
    freeDictionary: {},
    datamuse: {},
    oxford: {},
    linguaRobot: {},
    wordnik: {},
  });
  const [loadingApis, setLoadingApis] = useState<{
    freeDictionary: boolean;
    datamuse: boolean;
    oxford: boolean;
    linguaRobot: boolean;
    wordnik: boolean;
  }>({
    freeDictionary: false,
    datamuse: false,
    oxford: false,
    linguaRobot: false,
    wordnik: false,
  });
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

  const fetchFreeDictionaryApi = useCallback(async () => {
    if (!word?.word) return;
    setLoadingApis((prev) => ({ ...prev, freeDictionary: true }));
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
          word.word
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        setApiResults((prev) => ({ ...prev, freeDictionary: { data } }));
      } else {
        setApiResults((prev) => ({
          ...prev,
          freeDictionary: {
            error: `HTTP ${response.status}: ${response.statusText}`,
          },
        }));
      }
    } catch (error) {
      setApiResults((prev) => ({
        ...prev,
        freeDictionary: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }));
    } finally {
      setLoadingApis((prev) => ({ ...prev, freeDictionary: false }));
    }
  }, [word?.word]);

  const fetchDatamuseApi = useCallback(async () => {
    if (!word?.word) return;
    setLoadingApis((prev) => ({ ...prev, datamuse: true }));
    try {
      const response = await fetch(
        `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(
          word.word
        )}&max=10`
      );
      if (response.ok) {
        const data = await response.json();
        setApiResults((prev) => ({ ...prev, datamuse: { data } }));
      } else {
        setApiResults((prev) => ({
          ...prev,
          datamuse: {
            error: `HTTP ${response.status}: ${response.statusText}`,
          },
        }));
      }
    } catch (error) {
      setApiResults((prev) => ({
        ...prev,
        datamuse: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }));
    } finally {
      setLoadingApis((prev) => ({ ...prev, datamuse: false }));
    }
  }, [word?.word]);

  const fetchOxfordApi = useCallback(async () => {
    if (!word?.word) return;
    setLoadingApis((prev) => ({ ...prev, oxford: true }));
    try {
      const response = await fetch(
        `/api/oxford?word=${encodeURIComponent(word.word)}`
      );
      if (response.ok) {
        const data = await response.json();
        setApiResults((prev) => ({ ...prev, oxford: { data } }));
      } else {
        const errorData = await response.json();
        setApiResults((prev) => ({
          ...prev,
          oxford: {
            error:
              errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`,
          },
        }));
      }
    } catch (error) {
      setApiResults((prev) => ({
        ...prev,
        oxford: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }));
    } finally {
      setLoadingApis((prev) => ({ ...prev, oxford: false }));
    }
  }, [word?.word]);

  useEffect(() => {
    if (word?.word) {
      // Fetch data from free APIs
      fetchFreeDictionaryApi();
      fetchDatamuseApi();
      fetchOxfordApi();
    }
  }, [word?.word, fetchFreeDictionaryApi, fetchDatamuseApi, fetchOxfordApi]);

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
    <div className="bg-gray-50 dark:bg-gray-900">
      <audio ref={audioRef} />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/words"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mb-4 inline-block"
          >
            ← Back to My Words
          </Link>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {word?.word}
                </h1>
                {word?.details?.phonetics &&
                  word.details.phonetics.length > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-lg text-gray-600 dark:text-gray-400">
                        {word.details.phonetics[0].text}
                      </span>
                      <button
                        onClick={() =>
                          playAudio(word.details!.phonetics[0].audio)
                        }
                        title="Play pronunciation"
                      >
                        <svg
                          className="w-6 h-6 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
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
                  className="text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md disabled:opacity-50"
                >
                  {updating === "definition"
                    ? "Reloading..."
                    : "Reload Definition"}
                </button>
                <button
                  onClick={reloadTranslation}
                  disabled={!!updating}
                  className="text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md disabled:opacity-50"
                >
                  {updating === "translation"
                    ? "Reloading..."
                    : "Reload Translation"}
                </button>
              </div>
            </div>
            <div className="mt-4 text-gray-700 dark:text-gray-300 space-y-1">
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
          <div className="mb-6 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
            <p>{error}</p>
          </div>
        )}

        {/* Definitions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Detailed Definitions
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
            {word?.details?.meanings.map((meaning, i) => (
              <div key={i}>
                <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400 italic">
                  {meaning.partOfSpeech}
                </h3>
                <ol className="list-decimal list-inside mt-2 space-y-4">
                  {meaning.definitions.map((def, j) => (
                    <li key={j} className="text-gray-800 dark:text-gray-200">
                      <p className="font-medium">{def.definition}</p>
                      {def.example && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                          <em>&quot;{def.example}&quot;</em>
                        </p>
                      )}
                      {def.synonyms && def.synonyms.length > 0 && (
                        <p className="text-sm mt-1">
                          <strong className="text-gray-600 dark:text-gray-400">
                            Synonyms:
                          </strong>{" "}
                          {def.synonyms.join(", ")}
                        </p>
                      )}
                      {def.antonyms && def.antonyms.length > 0 && (
                        <p className="text-sm mt-1">
                          <strong className="text-gray-600 dark:text-gray-400">
                            Antonyms:
                          </strong>{" "}
                          {def.antonyms.join(", ")}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
            {word?.details && (
              <p className="text-right text-xs text-gray-500 dark:text-gray-400 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                from WordsAPI
              </p>
            )}
          </div>
        </div>

        {/* Raw Data Display */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Raw Data
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {JSON.stringify(word, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* APIs Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Dictionary APIs
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    API
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Features
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Free Tier?
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Comments
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    WordsAPI
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    ✅ Lemma lookup, ✅ definitions, ✅ synonyms/antonyms, ✅
                    examples, ✅ pronunciation
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    ✅ Yes (2500 req/mo)
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    Broad coverage, clean JSON. Not very context-aware.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Oxford Dictionaries API
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    ✅ Lemmatization, ✅ inflections, ✅ definitions, ✅
                    examples, ✅ usage notes
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    ✅ Yes (2000 req/mo)
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    Very rich data, but more formal usage.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Datamuse
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    ✅ Word similarity, ✅ rhymes, ✅ &quot;means like&quot;, ✅
                    part-of-speech tagging
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    ✅ Free
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    Doesn&apos;t give definitions, but amazing for exploring
                    similar forms.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Free Dictionary API
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    ✅ Definitions, ✅ examples, ✅ synonyms, ✅ pronunciation
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    ✅ Free
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    Not guaranteed to resolve derived words (e.g., inserting
                    might fail).
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Lingua Robot API
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    ✅ Full morphological data, ✅ definitions, ✅ examples, ✅
                    pronunciation
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    ✅ Free (limited)
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    Structured around parts of speech and word forms.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Wordnik
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    ✅ Definitions, ✅ examples, ✅ related words, ✅ audio
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    ✅ Free (limited)
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    Large dictionary DB, but less curated quality.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* API Results Comparison */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            API Results Comparison
          </h2>

          {/* WordsAPI Results */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              WordsAPI Results
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {word?.details
                    ? JSON.stringify(word.details, null, 2)
                    : "No data available"}
                </pre>
              </div>
            </div>
          </div>

          {/* Free Dictionary API Results */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Free Dictionary API Results
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                {loadingApis.freeDictionary ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Loading...
                    </span>
                  </div>
                ) : (
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {apiResults.freeDictionary.data
                      ? JSON.stringify(apiResults.freeDictionary.data, null, 2)
                      : "No data available"}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* Datamuse Results */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Datamuse Results
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                {loadingApis.datamuse ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Loading...
                    </span>
                  </div>
                ) : (
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {apiResults.datamuse.data
                      ? JSON.stringify(apiResults.datamuse.data, null, 2)
                      : "No data available"}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* Oxford Dictionaries API Results */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Oxford Dictionaries API Results
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                {loadingApis.oxford ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Loading...
                    </span>
                  </div>
                ) : (
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {apiResults.oxford.data
                      ? JSON.stringify(apiResults.oxford.data, null, 2)
                      : apiResults.oxford.error || "No data available"}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* Lingua Robot API Results */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Lingua Robot API Results
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {apiResults.linguaRobot.error ||
                    "API key required. To use this API, you need to sign up at https://rapidapi.com/lingua-robot-lingua-robot-default/api/lingua-robot/"}
                </pre>
              </div>
            </div>
          </div>

          {/* Wordnik Results */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Wordnik Results
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {apiResults.wordnik.error ||
                    "API key required. To use this API, you need to sign up at https://developer.wordnik.com/"}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Word Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Examples from your analyses ({sentences.length})
          </h2>
          {loadingSentences ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : sentences.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No examples found for this word in your saved analyses.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Try analyzing some text that contains this word.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sentences.map((sentence) => (
                <div
                  key={sentence.id}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <p
                    className="text-gray-900 dark:text-gray-100 leading-relaxed mb-2"
                    dangerouslySetInnerHTML={{
                      __html: highlightWord(
                        sentence.text,
                        wordParam || (word ? word.word : "")
                      ),
                    }}
                  />

                  {translatedSentences[sentence.id] ? (
                    <p className="text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
                      {translatedSentences[sentence.id]}
                    </p>
                  ) : (
                    <button
                      onClick={() =>
                        translateSentence(sentence.id, sentence.text)
                      }
                      disabled={translatingSentenceId === sentence.id}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                    >
                      {translatingSentenceId === sentence.id
                        ? "Translating..."
                        : "Translate"}
                    </button>
                  )}

                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      From:{" "}
                      <span className="text-blue-600 dark:text-blue-400">
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

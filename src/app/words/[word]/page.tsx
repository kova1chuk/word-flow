"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import { useSelector } from "react-redux";

import PageLoader from "@/components/PageLoader";

import { selectUser } from "@/entities/user/model/selectors";

import { config } from "@/lib/config";

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
      // TODO: Implement Supabase word fetching
      console.log("Fetching word:", wordParam);
      setError("Word fetching not implemented with Supabase yet");
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
      // TODO: Implement Supabase sentence fetching
      console.log("Fetching examples for:", wordParam);
      setSentences([]);
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

      // TODO: Update word in Supabase instead of Firebase
      console.log("Would update word with:", dataToUpdate);
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

      // TODO: Update word in Supabase instead of Firebase
      console.log("Would update translation:", newTranslation);
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

      // TODO: Save to Supabase instead of Firebase
      if (allResults.length > 0) {
        console.log("Would save Datamuse results:", {
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
        {/* Note: This page needs complete Supabase implementation */}
        <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-6 py-4 rounded-xl">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="font-medium">
              This page requires Supabase implementation to function properly.
            </p>
          </div>
        </div>

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
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Word Details Page
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                This page needs to be implemented with Supabase to display word
                details for: <strong>{wordParam}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

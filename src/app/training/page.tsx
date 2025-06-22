"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import WordTrainingCard from "@/components/WordTrainingCard";
import type { Word, WordDetails, Phonetic } from "@/types";
import { config } from "@/lib/config";
import Link from "next/link";
import PageLoader from "@/components/PageLoader";

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

export default function TrainingPage() {
  const { user, loading } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [loadingWords, setLoadingWords] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(0);
  const [trainingStarted, setTrainingStarted] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    "to_learn",
    "want_repeat",
    "unset",
  ]);
  const [trainingWords, setTrainingWords] = useState<Word[]>([]);

  const STATUS_OPTIONS = [
    { value: "to_learn", label: "To Learn", color: "bg-blue-600" },
    { value: "want_repeat", label: "Want Repeat", color: "bg-orange-400" },
    { value: "well_known", label: "Well Known", color: "bg-green-500" },
    { value: "unset", label: "No Status", color: "bg-gray-500" },
  ];

  const fetchWords = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingWords(true);
      setError("");
      const q = query(collection(db, "words"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const userWords = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Word[];

      // Sort words: 'to_learn' first, then 'want_repeat', then by creation date
      userWords.sort((a, b) => {
        const statusOrder: Record<string, number> = {
          to_learn: 1,
          want_repeat: 2,
        };
        const statusA = statusOrder[a.status || "unset"] || 3;
        const statusB = statusOrder[b.status || "unset"] || 3;

        if (statusA !== statusB) {
          return statusA - statusB;
        }

        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setWords(userWords);
    } catch (err) {
      console.error("Error fetching words:", err);
      setError("Failed to fetch words. Please try again.");
    } finally {
      setLoadingWords(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWords();
    }
  }, [user, fetchWords]);

  const handleStatusChange = async (wordId: string, status: string) => {
    setUpdating(wordId);
    try {
      await updateDoc(doc(db, "words", wordId), { status });
      setWords((prev) =>
        prev.map((w) => (w.id === wordId ? { ...w, status } : w))
      );
      setTrainingWords((prev) =>
        prev.map((w) => (w.id === wordId ? { ...w, status } : w))
      );
    } catch {
      setError("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const reloadDefinition = async (word: Word) => {
    setUpdating(word.id);
    try {
      let definition = "";
      let details: WordDetails | undefined = undefined;
      console.log(`Reloading definition for word: "${word.word}"`);

      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
          word.word
        )}`
      );
      console.log(`API response status: ${res.status}`);

      if (res.ok) {
        const data: DictionaryApiResponse[] = await res.json();
        console.log(`API response data:`, data);

        if (Array.isArray(data) && data.length > 0) {
          const firstResult = data[0];
          definition =
            firstResult.meanings?.[0]?.definitions?.[0]?.definition ??
            "No definition found.";

          details = {
            phonetics: (firstResult.phonetics || [])
              .map((p) => ({ text: p.text, audio: p.audio }))
              .filter((p): p is Phonetic => !!(p.text && p.audio)),
            meanings: (firstResult.meanings || []).map((m) => ({
              partOfSpeech: m.partOfSpeech,
              definitions: m.definitions.map((d) => ({
                definition: d.definition,
                example: d.example,
                synonyms: d.synonyms,
                antonyms: d.antonyms,
              })),
            })),
          };
          console.log(`Found definition: "${definition}"`, details);
        } else {
          definition = "No definition found.";
          console.log("No definition found in API response");
        }
      } else {
        definition = "No definition found.";
        console.log(`API request failed with status: ${res.status}`);
      }

      console.log(`Updating word document with definition and details`);
      const dataToUpdate = { definition, details };

      // Remove undefined fields before sending to Firestore
      Object.keys(dataToUpdate).forEach(
        (key) =>
          dataToUpdate[key as keyof typeof dataToUpdate] === undefined &&
          delete dataToUpdate[key as keyof typeof dataToUpdate]
      );

      await updateDoc(doc(db, "words", word.id), dataToUpdate);
      const updateWordState = (prev: Word[]) =>
        prev.map((w) => (w.id === word.id ? { ...w, ...dataToUpdate } : w));
      setWords(updateWordState);
      setTrainingWords(updateWordState);
      console.log("Definition reload completed successfully");
    } catch (error) {
      console.error("Error reloading definition:", error);
      setError(
        `Failed to reload definition: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setUpdating(null);
    }
  };

  const reloadTranslation = async (word: Word) => {
    setUpdating(word.id);
    try {
      let translation = "";
      console.log(`Reloading translation for word: "${word.word}"`);

      // Using MyMemory API
      const langPair = `en|uk`; // English to Ukrainian
      const url = `${config.translationApi.baseUrl}?q=${encodeURIComponent(
        word.word
      )}&langpair=${langPair}`;

      const res = await fetch(url);
      console.log(`Translation API response status: ${res.status}`);

      if (res.ok) {
        const data = await res.json();
        console.log(`Translation API response data:`, data);
        if (data.responseData && data.responseData.translatedText) {
          translation = data.responseData.translatedText;
          console.log(`Found translation: "${translation}"`);
        } else {
          translation = "No translation found.";
          console.log(`No translation found in API response.`);
        }
      } else {
        translation = "No translation found.";
        console.log(
          `Translation API request failed with status: ${res.status}`
        );
      }

      console.log(`Updating word document with translation: "${translation}"`);
      await updateDoc(doc(db, "words", word.id), { translation });
      setWords((prev) =>
        prev.map((w) => (w.id === word.id ? { ...w, translation } : w))
      );
      setTrainingWords((prev) =>
        prev.map((w) => (w.id === word.id ? { ...w, translation } : w))
      );
      console.log("Translation reload completed successfully");
    } catch (error) {
      console.error("Error reloading translation:", error);
      setError(
        `Failed to reload translation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setUpdating(null);
    }
  };

  const toggleStatusSelection = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const startTraining = () => {
    const filteredWords = words.filter((word) => {
      if (selectedStatuses.includes("unset")) {
        return selectedStatuses.includes(word.status || "unset");
      }
      return selectedStatuses.includes(word.status || "");
    });

    if (filteredWords.length === 0) {
      setError(
        "No words match the selected statuses. Please select different statuses."
      );
      return;
    }

    // Shuffle the words for random order
    const shuffledWords = [...filteredWords].sort(() => Math.random() - 0.5);
    setTrainingWords(shuffledWords);
    setCurrent(0);
    setTrainingStarted(true);
    setError("");
  };

  const stopTraining = () => {
    setTrainingStarted(false);
    setTrainingWords([]);
    setCurrent(0);
  };

  const getStatusCount = (status: string) => {
    if (status === "unset") {
      return words.filter((word) => !word.status).length;
    }
    return words.filter((word) => word.status === status).length;
  };

  if (loading) {
    return <PageLoader text="Loading training words..." />;
  }

  if (!words.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No words in your collection
          </h1>
          <p className="text-gray-600">Add some words to start training!</p>
        </div>
      </div>
    );
  }

  // Training Settings Screen
  if (!trainingStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Word Training
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Practice and reinforce your vocabulary with interactive training
              sessions.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
              <p>{error}</p>
            </div>
          )}

          {loadingWords ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : words.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No words available for training
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add some words to your collection to start training.
              </p>
              <div className="mt-6">
                <Link
                  href="/words"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Words
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Select Words to Train
              </h2>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Word Statuses
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {STATUS_OPTIONS.map((status) => (
                    <div
                      key={status.value}
                      className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedStatuses.includes(status.value)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                      onClick={() => toggleStatusSelection(status.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                            {status.label}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {getStatusCount(status.value)} words
                          </div>
                        </div>
                        <div
                          className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 ${
                            selectedStatuses.includes(status.value)
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={startTraining}
                  disabled={selectedStatuses.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-8 py-3 rounded-md font-medium transition-colors disabled:cursor-not-allowed"
                >
                  Start Training
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Training Session Screen
  const currentWord = trainingWords[current];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Training Session
          </h1>
          <button
            onClick={stopTraining}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Stop Training
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
            <p>{error}</p>
          </div>
        )}

        <WordTrainingCard
          word={currentWord}
          onReloadDefinition={reloadDefinition}
          onReloadTranslation={reloadTranslation}
          onStatusChange={handleStatusChange}
          updating={updating}
          current={current}
          total={trainingWords.length}
          onPrev={() => setCurrent(Math.max(0, current - 1))}
          onNext={() =>
            setCurrent(Math.min(trainingWords.length - 1, current + 1))
          }
        />
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import WordTrainingCard from "@/components/WordTrainingCard";
import { config } from "@/lib/config";

interface Word {
  id: string;
  word: string;
  definition: string;
  translation?: string;
  status?: string;
  createdAt: Timestamp;
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

  useEffect(() => {
    if (!loading && !user) {
      return;
    }
    if (user) {
      fetchWords();
    }
  }, [user, loading]);

  const fetchWords = async () => {
    if (!user) return;
    setLoadingWords(true);
    try {
      const wordsRef = collection(db, "words");
      const q = query(wordsRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const wordsData: Word[] = [];
      querySnapshot.forEach((doc) => {
        wordsData.push({
          id: doc.id,
          ...doc.data(),
        } as Word);
      });
      setWords(wordsData);
      setCurrent(0);
    } catch {
      setError("Failed to load words");
    } finally {
      setLoadingWords(false);
    }
  };

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
      console.log(`Reloading definition for word: "${word.word}"`);

      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
          word.word
        )}`
      );
      console.log(`API response status: ${res.status}`);

      if (res.ok) {
        const data = await res.json();
        console.log(`API response data:`, data);

        if (
          Array.isArray(data) &&
          data[0]?.meanings?.[0]?.definitions?.[0]?.definition
        ) {
          definition = data[0].meanings[0].definitions[0].definition;
          console.log(`Found definition: "${definition}"`);
        } else {
          definition = "No definition found.";
          console.log("No definition found in API response");
        }
      } else {
        definition = "No definition found.";
        console.log(`API request failed with status: ${res.status}`);
      }

      console.log(`Updating word document with definition: "${definition}"`);
      await updateDoc(doc(db, "words", word.id), { definition });
      setWords((prev) =>
        prev.map((w) => (w.id === word.id ? { ...w, definition } : w))
      );
      setTrainingWords((prev) =>
        prev.map((w) => (w.id === word.id ? { ...w, definition } : w))
      );
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

      const res = await fetch(`${config.backendUri}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: word.word,
          source: "en",
          target: "uk",
          format: "text",
        }),
      });
      console.log(`Translation API response status: ${res.status}`);

      if (res.ok) {
        const data = await res.json();
        console.log(`Translation API response data:`, data);
        translation = data.translatedText || "No translation found.";
        console.log(`Found translation: "${translation}"`);
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

  if (loading || loadingWords) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Training Settings
            </h1>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Select which words to train:
              </h2>
              <div className="grid gap-3">
                {STATUS_OPTIONS.map((option) => {
                  const count = getStatusCount(option.value);
                  const isSelected = selectedStatuses.includes(option.value);

                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleStatusSelection(option.value)}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full ${option.color}`}
                        ></div>
                        <span className="font-medium text-gray-900">
                          {option.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {count} words
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={startTraining}
                disabled={selectedStatuses.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Training
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Training Session Screen
  const currentWord = trainingWords[current];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Training Session</h1>
          <button
            onClick={stopTraining}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Stop Training
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 text-center">
            <p className="text-red-700">{error}</p>
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
          onPrev={() => setCurrent((c) => Math.max(0, c - 1))}
          onNext={() =>
            setCurrent((c) => Math.min(trainingWords.length - 1, c + 1))
          }
        />
      </div>
    </div>
  );
}

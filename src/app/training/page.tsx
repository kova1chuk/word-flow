"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import type { Word, WordDetails, Phonetic } from "@/types";
import { config } from "@/lib/config";
import PageLoader from "@/components/PageLoader";
import WordTrainingCard from "@/components/WordTrainingCard";

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
  const [trainingMode, setTrainingMode] = useState<"word" | "sentence">("word");

  // Word training state (only used when trainingMode === 'word')
  const [words, setWords] = useState<Word[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(0);
  const [trainingStarted, setTrainingStarted] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([
    1,
    2,
    3,
    4,
    5, // Include all statuses except mastered for training
  ]);
  const [trainingWords, setTrainingWords] = useState<Word[]>([]);

  const STATUS_OPTIONS = [
    { value: 1, label: "Not Learned", color: "bg-gray-500" },
    { value: 2, label: "Beginner", color: "bg-red-500" },
    { value: 3, label: "Basic", color: "bg-orange-500" },
    { value: 4, label: "Intermediate", color: "bg-yellow-500" },
    { value: 5, label: "Advanced", color: "bg-blue-500" },
    { value: 6, label: "Well Known", color: "bg-green-500" },
    { value: 7, label: "Mastered", color: "bg-purple-500" },
  ];

  const fetchWords = useCallback(async () => {
    if (!user) return;
    try {
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
    }
  }, [user]);

  useEffect(() => {
    if (user && trainingMode === "word") {
      fetchWords();
    }
  }, [user, fetchWords, trainingMode]);

  const handleStatusChange = async (
    wordId: string,
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7
  ) => {
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
    setError("");
    try {
      let definition = "";
      let details: WordDetails | undefined = undefined;

      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
          word.word
        )}`
      );

      if (res.ok) {
        const data: DictionaryApiResponse[] = await res.json();
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
              definitions: m.definitions.map((d) => {
                const newDef: {
                  definition: string;
                  example?: string;
                  synonyms?: string[];
                  antonyms?: string[];
                } = { definition: d.definition };
                if (d.example) newDef.example = d.example;
                if (d.synonyms) newDef.synonyms = d.synonyms;
                if (d.antonyms) newDef.antonyms = d.antonyms;
                return newDef;
              }),
            })),
          };
        } else {
          definition = "No definition found.";
        }
      } else {
        definition = "No definition found.";
      }

      const dataToUpdate: { definition: string; details?: WordDetails } = {
        definition,
      };
      if (details) {
        dataToUpdate.details = details;
      }

      await updateDoc(doc(db, "words", word.id), dataToUpdate);

      const updateWordState = (prev: Word[]) =>
        prev.map((w) => (w.id === word.id ? { ...w, ...dataToUpdate } : w));
      setWords(updateWordState);
      setTrainingWords(updateWordState);
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

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.responseData && data.responseData.translatedText) {
          translation = data.responseData.translatedText;
        } else {
          translation = "Translation not found";
        }
      } else {
        translation = "Translation not found";
      }

      await updateDoc(doc(db, "words", word.id), { translation });

      const updateWordState = (prev: Word[]) =>
        prev.map((w) => (w.id === word.id ? { ...w, translation } : w));
      setWords(updateWordState);
      setTrainingWords(updateWordState);
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

  const toggleStatusSelection = (status: number) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const startTraining = () => {
    const filteredWords = words.filter((word) =>
      selectedStatuses.includes(word.status || 1)
    );
    setTrainingWords(filteredWords);
    setCurrent(0);
    setTrainingStarted(true);
  };

  const stopTraining = () => {
    setTrainingStarted(false);
    setTrainingWords([]);
    setCurrent(0);
  };

  const getStatusCount = (status: number) => {
    return words.filter((word) => word.status === status).length;
  };

  function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function SentenceTraining() {
    // Mock data for demo - moved outside to prevent recreation on every render
    const sentences = useMemo(
      () => [
        {
          english: "I am learning English",
          translation: "Я вивчаю англійську",
        },
        {
          english: "The cat is on the table",
          translation: "Кіт на столі",
        },
        {
          english: "She likes to read books",
          translation: "Вона любить читати книги",
        },
      ],
      []
    );
    const [current, setCurrent] = useState(0);
    const [shuffled, setShuffled] = useState<string[]>([]);
    const [answer, setAnswer] = useState<string[]>([]);
    const [checked, setChecked] = useState<null | boolean>(null);

    useEffect(() => {
      const words = sentences[current].english.split(" ");
      setShuffled(shuffleArray(words));
      setAnswer([]);
      setChecked(null);
    }, [current]);

    const handleWordClick = (word: string) => {
      if (checked) return;
      if (answer.includes(word)) return;
      setAnswer([...answer, word]);
    };
    const handleRemove = (idx: number) => {
      if (checked) return;
      setAnswer(answer.filter((_, i) => i !== idx));
    };
    const handleCheck = () => {
      setChecked(answer.join(" ") === sentences[current].english);
    };
    const handleNext = () => {
      setCurrent((prev) => (prev + 1) % sentences.length);
    };

    const words = sentences[current].english.split(" ");

    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-300 max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Sentence Training</h2>
        <div className="mb-4">
          <span className="text-gray-400">Translate:</span>
          <div className="text-lg font-semibold text-white mt-1 mb-2">
            {sentences[current].translation}
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          {shuffled.map((word, i) => (
            <button
              key={i}
              className={`px-3 py-2 rounded bg-gray-700 text-white text-base font-medium transition-colors duration-150 ${
                answer.includes(word)
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-blue-600"
              }`}
              onClick={() => handleWordClick(word)}
              disabled={answer.includes(word) || !!checked}
            >
              {word}
            </button>
          ))}
        </div>
        <div className="mb-4 min-h-[40px] flex flex-wrap gap-2 justify-center">
          {answer.map((word, i) => (
            <button
              key={i}
              className="px-3 py-2 rounded bg-blue-600 text-white text-base font-medium hover:bg-blue-700"
              onClick={() => handleRemove(i)}
              disabled={!!checked}
            >
              {word}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <button
            className="px-4 py-2 rounded bg-green-600 text-white font-semibold disabled:opacity-50"
            onClick={handleCheck}
            disabled={answer.length !== words.length || checked !== null}
          >
            Check
          </button>
          {checked !== null && (
            <span
              className={`ml-4 font-bold ${
                checked ? "text-green-400" : "text-red-400"
              }`}
            >
              {checked ? "Correct!" : "Try again!"}
            </span>
          )}
        </div>
        {checked && (
          <button
            className="px-4 py-2 rounded bg-purple-600 text-white font-semibold mt-2"
            onClick={handleNext}
          >
            Next Sentence
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return <PageLoader text="Loading..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to access training
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-center mb-6 gap-2">
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
            trainingMode === "word"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
          onClick={() => setTrainingMode("word")}
        >
          Word Training
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
            trainingMode === "sentence"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
          onClick={() => setTrainingMode("sentence")}
        >
          Sentence Training
        </button>
      </div>

      {trainingMode === "word" ? (
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

            {trainingStarted && trainingWords.length > 0 ? (
              <div>
                <WordTrainingCard
                  word={trainingWords[current]}
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
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Select Word Statuses to Train
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleStatusSelection(option.value)}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        selectedStatuses.includes(option.value)
                          ? `${option.color} text-white border-transparent`
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <div className="text-2xl font-bold">
                        {getStatusCount(option.value)}
                      </div>
                      <div className="text-sm">{option.label}</div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={startTraining}
                  disabled={selectedStatuses.length === 0}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Training
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <SentenceTraining />
      )}
    </div>
  );
}

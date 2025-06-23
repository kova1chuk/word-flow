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
  const [trainingMode, setTrainingMode] = useState<"word" | "sentence">("word");

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

  function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function SentenceTraining() {
    // Mock data for demo
    const sentences = [
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
    ];
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
    return <PageLoader text="Loading training words..." />;
  }
}

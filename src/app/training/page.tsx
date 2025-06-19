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
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
          word.word
        )}`
      );
      if (res.ok) {
        const data = await res.json();
        if (
          Array.isArray(data) &&
          data[0]?.meanings?.[0]?.definitions?.[0]?.definition
        ) {
          definition = data[0].meanings[0].definitions[0].definition;
        } else {
          definition = "No definition found.";
        }
      } else {
        definition = "No definition found.";
      }
      await updateDoc(doc(db, "words", word.id), { definition });
      setWords((prev) =>
        prev.map((w) => (w.id === word.id ? { ...w, definition } : w))
      );
    } catch {
      setError("Failed to reload definition");
    } finally {
      setUpdating(null);
    }
  };

  const reloadTranslation = async (word: Word) => {
    setUpdating(word.id);
    try {
      let translation = "";
      const res = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: word.word,
          source: "en",
          target: "uk", // Example: translate to Ukrainian
          format: "text",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        translation = data.translatedText;
      } else {
        translation = "[Translation error]";
      }
      await updateDoc(doc(db, "words", word.id), { translation });
      setWords((prev) =>
        prev.map((w) => (w.id === word.id ? { ...w, translation } : w))
      );
    } catch {
      setError("Failed to reload translation");
    } finally {
      setUpdating(null);
    }
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
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No words in your collection.
      </div>
    );
  }

  const word = words[current];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Word Training
        </h1>
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        <WordTrainingCard
          word={word}
          onReloadDefinition={reloadDefinition}
          onReloadTranslation={reloadTranslation}
          onStatusChange={handleStatusChange}
          updating={updating}
          current={current}
          total={words.length}
          onPrev={() => setCurrent((c) => Math.max(0, c - 1))}
          onNext={() => setCurrent((c) => Math.min(words.length - 1, c + 1))}
        />
      </div>
    </div>
  );
}

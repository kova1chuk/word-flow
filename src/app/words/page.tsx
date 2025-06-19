"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

interface Word {
  id: string;
  word: string;
  definition: string;
  example: string;
  createdAt: Timestamp;
  translation?: string;
  status?: string;
}

export default function WordsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [loadingWords, setLoadingWords] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [newExample, setNewExample] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
      return;
    }

    if (user) {
      fetchWords();
    }
  }, [user, loading, router]);

  const fetchWords = async () => {
    if (!user) return;

    try {
      setLoadingWords(true);
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

      // Sort by createdAt in descending order (newest first)
      wordsData.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

      setWords(wordsData);
    } catch (error) {
      console.error("Error fetching words:", error);
      setError("Failed to load words");
    } finally {
      setLoadingWords(false);
    }
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (!newWord.trim() || !newDefinition.trim()) {
      setError("Word and definition are required");
      return;
    }

    // Check if word already exists
    const wordExists = words.some(
      (word) => word.word.toLowerCase().trim() === newWord.toLowerCase().trim()
    );

    if (wordExists) {
      setError("This word already exists in your collection");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const wordsRef = collection(db, "words");
      await addDoc(wordsRef, {
        userId: user.uid,
        word: newWord.trim(),
        definition: newDefinition.trim(),
        example: newExample.trim(),
        createdAt: Timestamp.now(),
      });

      // Reset form
      setNewWord("");
      setNewDefinition("");
      setNewExample("");
      setShowAddForm(false);

      // Refresh words list
      await fetchWords();
    } catch (error) {
      console.error("Error adding word:", error);
      setError("Failed to add word");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWord = async (wordId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, "words", wordId));
      await fetchWords();
    } catch (error) {
      console.error("Error deleting word:", error);
      setError("Failed to delete word");
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

  const reloadDefinition = async (word) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Words</h1>
          <p className="text-gray-600">Manage your personal word collection</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {showAddForm ? "Cancel" : "+ Add New Word"}
          </button>
        </div>

        {showAddForm && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Add New Word
            </h2>
            <form onSubmit={handleAddWord} className="space-y-4">
              <div>
                <label
                  htmlFor="word"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Word *
                </label>
                <input
                  type="text"
                  id="word"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter a word"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="definition"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Definition *
                </label>
                <textarea
                  id="definition"
                  value={newDefinition}
                  onChange={(e) => setNewDefinition(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter the definition"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="example"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Example (optional)
                </label>
                <textarea
                  id="example"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter an example sentence"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Adding..." : "Add Word"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loadingWords ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : words.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No words yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start building your vocabulary by adding your first word!
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Add Your First Word
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {words.map((word) => (
              <div key={word.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {word.word}
                  </h3>
                  <button
                    onClick={() => handleDeleteWord(word.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Definition
                    </h4>
                    <p className="text-gray-900">{word.definition}</p>
                  </div>

                  {word.example && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Example
                      </h4>
                      <p className="text-gray-600 italic">
                        &ldquo;{word.example}&rdquo;
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Added: {word.createdAt.toDate().toLocaleDateString()}
                  </div>

                  <div className="mt-2 text-green-700">
                    Translation:{" "}
                    {word.translation || (
                      <span className="text-gray-400">(none)</span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Status: {word.status || "to_learn"}
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => reloadTranslation(word)}
                    disabled={updating === word.id}
                    className="text-blue-600 hover:text-blue-800 text-xs border border-blue-200 rounded px-2 py-1 ml-1 disabled:opacity-50"
                  >
                    Reload
                  </button>
                </div>

                <div className="mt-2 text-gray-800">
                  Definition:{" "}
                  {word.definition || (
                    <span className="text-gray-400">(none)</span>
                  )}{" "}
                  <button
                    onClick={() => reloadDefinition(word)}
                    disabled={updating === word.id}
                    className="text-blue-600 hover:text-blue-800 text-xs border border-blue-200 rounded px-2 py-1 ml-1 disabled:opacity-50"
                  >
                    Reload
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

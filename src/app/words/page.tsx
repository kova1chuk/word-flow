"use client";

import { useState, useEffect, useCallback } from "react";
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
import WordCard from "@/components/WordCard";
import type { Word, WordDetails, Phonetic } from "@/types";
import { config } from "@/lib/config";

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

export default function WordsPage() {
  const { user, loading } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [loadingWords, setLoadingWords] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [newExample, setNewExample] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const STATUS_OPTIONS = [
    { value: "all", label: "All Statuses" },
    { value: "well_known", label: "Well Known" },
    { value: "want_repeat", label: "Want Repeat" },
    { value: "to_learn", label: "To Learn" },
    { value: "unset", label: "No Status" },
  ];

  const PAGE_SIZE_OPTIONS = [6, 12, 24, 48];

  const fetchWords = useCallback(async () => {
    if (!user) return;
    setLoadingWords(true);
    try {
      const q = query(collection(db, "words"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const wordsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Word[];
      setWords(wordsData);
    } catch (err) {
      console.error("Error fetching words:", err);
      setError("Failed to load words");
    } finally {
      setLoadingWords(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWords();
    }
  }, [user, fetchWords]);

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

  const handleDeleteWord = async (word: Word) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "words", word.id));
      await fetchWords();
    } catch (error) {
      console.error("Error deleting word:", error);
      setError("Failed to delete word");
    }
  };

  const onReloadDefinition = async (word: Word) => {
    setUpdating(word.id);
    try {
      let definition = "";
      let details: WordDetails | undefined = undefined;
      console.log(`Reloading definition for word: "${word.word}"`);

      const res = await fetch(
        `${config.dictionaryApi}/${encodeURIComponent(word.word)}`
      );
      console.log(`API response status: ${res.status}`);

      if (res.ok) {
        const data: DictionaryApiResponse[] = await res.json();
        console.log(`API response data:`, data);

        if (Array.isArray(data) && data.length > 0) {
          const firstResult = data[0];
          // Set primary definition
          definition =
            firstResult.meanings?.[0]?.definitions?.[0]?.definition ??
            "No definition found.";

          // Extract detailed information
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

      const wordRef = doc(db, "words", word.id);
      await updateDoc(wordRef, dataToUpdate);
      fetchWords();
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

  const onReloadTranslation = async (word: Word) => {
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
      const wordRef = doc(db, "words", word.id);
      await updateDoc(wordRef, { translation });
      fetchWords();
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

  const onStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const wordRef = doc(db, "words", id);
      await updateDoc(wordRef, { status });
      fetchWords();
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const filteredWords = words.filter((word) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "unset") return !word.status;
    return word.status === statusFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredWords.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentWords = filteredWords.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    goToPage(currentPage - 1);
  };

  const goToNextPage = () => {
    goToPage(currentPage + 1);
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

        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {showAddForm ? "Cancel" : "+ Add New Word"}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Filter by status:
            </span>
            <div className="flex gap-1">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
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
        ) : filteredWords.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {words.length === 0
                ? "No words yet"
                : "No words match the selected filter"}
            </h3>
            <p className="text-gray-600 mb-4">
              {words.length === 0
                ? "Start building your vocabulary by adding your first word!"
                : "Try selecting a different status filter to see more words."}
            </p>
            {words.length === 0 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Add Your First Word
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentWords.map((word) => (
                <WordCard
                  key={word.id}
                  word={word}
                  onReloadDefinition={onReloadDefinition}
                  onReloadTranslation={onReloadTranslation}
                  onDelete={handleDeleteWord}
                  onStatusChange={onStatusChange}
                  updating={updating}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, filteredWords.length)} of{" "}
                    {filteredWords.length} words
                  </span>
                  <div className="flex items-center gap-2">
                    <label htmlFor="pageSize" className="text-sm text-gray-700">
                      Words per page:
                    </label>
                    <select
                      id="pageSize"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

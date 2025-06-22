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
    setError("");
    try {
      let definition = "";
      let details: WordDetails | undefined = undefined;

      const res = await fetch(
        `${config.dictionaryApi}/${encodeURIComponent(word.word)}`
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

      const wordRef = doc(db, "words", word.id);
      await updateDoc(wordRef, dataToUpdate);
      fetchWords();
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
    return <PageLoader text="Loading words..." />;
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Words
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your vocabulary collection and track your learning progress.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
            <p>{error}</p>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Add New Word
            </h2>
            <form onSubmit={handleAddWord} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Word
                  </label>
                  <input
                    type="text"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter word"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Definition
                  </label>
                  <input
                    type="text"
                    value={newDefinition}
                    onChange={(e) => setNewDefinition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter definition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Example (optional)
                  </label>
                  <input
                    type="text"
                    value={newExample}
                    onChange={(e) => setNewExample(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter example sentence"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed"
              >
                {submitting ? "Adding..." : "Add Word"}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Words per page
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredWords.length} words total
            </div>
          </div>
        </div>

        {loadingWords ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredWords.length === 0 ? (
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
              No words found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {statusFilter === "all"
                ? "Get started by adding your first word."
                : `No words with status "${
                    STATUS_OPTIONS.find((opt) => opt.value === statusFilter)
                      ?.label
                  }".`}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <span>
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, filteredWords.length)} of{" "}
                    {filteredWords.length} words
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
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
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

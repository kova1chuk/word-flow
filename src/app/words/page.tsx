"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  selectUser,
  selectIsAuthenticated,
} from "@/entities/user/model/selectors";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import WordCard from "@/components/WordCard";
import type { Word, WordDetails, Phonetic } from "@/types";
import { config } from "@/lib/config";
import PageLoader from "@/components/PageLoader";
import { updateWordStatsOnStatusChange } from "@/features/word-management/lib/updateWordStatsOnStatusChange";
import WordFilterControls from "@/shared/ui/WordFilterControls";

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
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [words, setWords] = useState<Word[]>([]);
  const [loadingWords, setLoadingWords] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<(string | number)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [search, setSearch] = useState("");

  const STATUS_OPTIONS = [
    { value: "all", label: "All Statuses" },
    { value: "1", label: "Not Learned" },
    { value: "2", label: "Beginner" },
    { value: "3", label: "Basic" },
    { value: "4", label: "Intermediate" },
    { value: "5", label: "Advanced" },
    { value: "6", label: "Well Known" },
    { value: "7", label: "Mastered" },
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

  const handleDeleteWord = async (word: Word) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "words", word.id));
      setWords((prev) => prev.filter((w) => w.id !== word.id));
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
      if (details) dataToUpdate.details = details;

      await updateDoc(doc(db, "words", word.id), dataToUpdate);
      setWords((prev) =>
        prev.map((w) => (w.id === word.id ? { ...w, ...dataToUpdate } : w))
      );
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
    setError("");
    try {
      let translation = "";
      const langPair = `en|uk`;
      const url = `${config.translationApi.baseUrl}?q=${encodeURIComponent(
        word.word
      )}&langpair=${langPair}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.responseData && data.responseData.translatedText) {
          translation = data.responseData.translatedText;
        } else {
          translation = "No translation found.";
        }
      } else {
        translation = "No translation found.";
      }

      await updateDoc(doc(db, "words", word.id), { translation });
      setWords((prev) =>
        prev.map((w) => (w.id === word.id ? { ...w, translation } : w))
      );
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

  const onStatusChange = async (
    id: string,
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7
  ) => {
    setUpdating(id);
    setError("");
    try {
      // Find the word and its old status
      const word = words.find((w) => w.id === id);
      if (!word || !user) throw new Error("Word or user not found");
      const oldStatus = word.status;
      if (typeof oldStatus !== "number") {
        throw new Error("Old status is not a number");
      }
      await updateDoc(doc(db, "words", id), { status });
      setWords((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)));
      await updateWordStatsOnStatusChange({
        wordId: id,
        userId: user.uid,
        oldStatus,
        newStatus: status,
      });
    } catch (error) {
      console.error("Error updating word status:", error);
      setError("Failed to update word status");
    } finally {
      setUpdating(null);
    }
  };

  const filteredWords = words
    .filter((word) => {
      if (statusFilter.length === 0) return true; // Show all if none selected
      if (statusFilter.includes("unset")) return !word.status;
      return word.status !== undefined && statusFilter.includes(word.status);
    })
    .filter((word) =>
      search.trim() === ""
        ? true
        : word.word.toLowerCase().includes(search.trim().toLowerCase())
    );

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

  if (!isAuthenticated) {
    return <PageLoader text="Loading..." />;
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <WordFilterControls
          selectedStatuses={statusFilter}
          onStatusFilterChange={setStatusFilter}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          search={search}
          onSearchChange={setSearch}
          statusOptions={STATUS_OPTIONS}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          totalCount={words.length}
          filteredCount={filteredWords.length}
        />
        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
            <p>{error}</p>
          </div>
        )}
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
              {statusFilter.length === 0
                ? "Get started by adding your first word."
                : `No words with status "${
                    statusFilter[0] !== undefined
                      ? STATUS_OPTIONS.find(
                          (opt) => opt.value === statusFilter[0]
                        )?.label ?? statusFilter[0]
                      : "Unknown"
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

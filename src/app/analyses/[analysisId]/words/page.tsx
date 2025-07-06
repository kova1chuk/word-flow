"use client";

import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectUser } from "@/entities/user/model/selectors";
import { useAnalysisWords } from "@/features/analysis-words";
import LoadingSpinner from "@/components/LoadingSpinner";
import { WordList } from "@/features/analysis-words/ui/WordList";
import { AnalysisWordsHeader } from "@/features/analysis-words/ui/AnalysisWordsHeader";
import WordFilterControls from "@/shared/ui/WordFilterControls";
import { useState } from "react";
import React from "react";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { config } from "@/lib/config";
import { updateWordStatsOnStatusChange } from "@/features/word-management/lib/updateWordStatsOnStatusChange";
import type { AnalysisWord } from "@/features/analysis-words/lib/useAnalysisWords";

export default function AnalysisWordsPage() {
  const user = useSelector(selectUser);
  const params = useParams();
  const analysisId = params.analysisId as string;

  // Pagination state
  const [pageSize, setPageSize] = useState(12);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [pageCursorStack, setPageCursorStack] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]);
  const [currentCursor, setCurrentCursor] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  // Fetch paginated words
  const { words, analysis, loading, error, refreshWords, nextCursor } =
    useAnalysisWords(analysisId, {
      pageSize,
      statusFilter,
      search,
      pageCursor: currentCursor,
    });

  // Pagination handlers
  const handleNextPage = () => {
    if (nextCursor) {
      setPageCursorStack((prev) => [...prev, nextCursor]);
      setCurrentCursor(nextCursor);
    }
  };
  const handlePrevPage = () => {
    setPageCursorStack((prev) => {
      if (prev.length === 0) return prev;
      const newStack = prev.slice(0, -1);
      setCurrentCursor(newStack[newStack.length - 1] || null);
      return newStack;
    });
  };
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentCursor(null);
    setPageCursorStack([]);
  };
  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentCursor(null);
    setPageCursorStack([]);
  };
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentCursor(null);
    setPageCursorStack([]);
  };

  // Handlers for WordCard actions
  const [updatingWordId, setUpdatingWordId] = useState<string | null>(null);
  const [wordsState, setWordsState] = useState<AnalysisWord[]>([]);

  // Sync wordsState with fetched words
  React.useEffect(() => {
    setWordsState(words);
  }, [words]);

  const handleStatusChange = async (
    id: string,
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7
  ) => {
    const word = wordsState.find((w) => w.id === id);
    const oldStatus = word?.status;
    if (!word || typeof oldStatus !== "number") return;
    // Optimistically update local state
    setWordsState((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status } : w))
    );
    setUpdatingWordId(id);
    try {
      await updateDoc(doc(db, "words", id), { status });
      if (user) {
        await updateWordStatsOnStatusChange({
          wordId: id,
          userId: user.uid,
          oldStatus,
          newStatus: status,
        });
      }
    } catch {
      // Revert on error
      setWordsState((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: oldStatus } : w))
      );
      // Optionally show error
    } finally {
      setUpdatingWordId(null);
    }
  };
  const handleReloadDefinition = async (word: AnalysisWord) => {
    let definition = "";
    try {
      const res = await fetch(
        `${config.dictionaryApi}/${encodeURIComponent(word.word)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          definition =
            data[0]?.meanings?.[0]?.definitions?.[0]?.definition ??
            "No definition found.";
        } else {
          definition = "No definition found.";
        }
      } else {
        definition = "No definition found.";
      }
      await updateDoc(doc(db, "words", word.id), { definition });
      refreshWords();
    } catch {
      // Optionally show error
    }
  };
  const handleReloadTranslation = async (word: AnalysisWord) => {
    let translation = "";
    try {
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
      refreshWords();
    } catch {
      // Optionally show error
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please sign in to view words
          </h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error loading words
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshWords}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnalysisWordsHeader analysis={analysis} />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <WordFilterControls
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          search={search}
          onSearchChange={handleSearchChange}
          statusOptions={STATUS_OPTIONS}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          totalCount={
            analysis?.summary?.wordStats
              ? Object.values(analysis.summary.wordStats).reduce(
                  (a, b) => a + b,
                  0
                )
              : 0
          }
          filteredCount={words.length}
        />
        <WordList
          words={wordsState}
          onStatusChange={handleStatusChange}
          onReloadDefinition={handleReloadDefinition}
          onReloadTranslation={handleReloadTranslation}
          updating={updatingWordId}
        />
        {/* Pagination Controls */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing {words.length > 0 ? 1 : 0} to {words.length} of{" "}
              {analysis?.summary?.wordStats
                ? Object.values(analysis.summary.wordStats).reduce(
                    (a, b) => a + b,
                    0
                  )
                : 0}{" "}
              words
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={pageCursorStack.length === 0}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!nextCursor}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

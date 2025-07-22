"use client";

import React, { useState } from "react";

import { useParams } from "next/navigation";

import { useSelector } from "react-redux";

import LoadingSpinner from "@/components/LoadingSpinner";

import { useAnalysisWords } from "@/features/analysis-words";
import type { AnalysisWord } from "@/features/analysis-words/lib/useAnalysisWords";
import { AnalysisWordsHeader } from "@/features/analysis-words/ui/AnalysisWordsHeader";
import { WordList } from "@/features/analysis-words/ui/WordList";

import { selectUser } from "@/entities/user/model/selectors";

import WordFilterControls from "@/shared/ui/WordFilterControls";

export default function AnalysisWordsPage() {
  const user = useSelector(selectUser);
  const params = useParams();
  const analysisId = params.analysisId as string;

  // Pagination state
  const [pageSize, setPageSize] = useState(12);
  const [selectedStatuses, setSelectedStatuses] = useState<(string | number)[]>(
    [],
  );
  const [search, setSearch] = useState("");

  // Fetch paginated words - Note: This hook needs to be updated for Supabase
  const { words, analysis, loading, error, refreshWords } = useAnalysisWords(
    analysisId,
    {
      pageSize,
      statusFilter: selectedStatuses.length === 0 ? "all" : selectedStatuses,
      search,
    },
  );

  // Pagination handlers - Simplified for now
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };
  const handleStatusFilterChange = (statuses: (string | number)[]) => {
    const filteredStatuses = statuses.filter((s) => s !== "all");
    setSelectedStatuses(filteredStatuses);
  };
  const handleSearchChange = (val: string) => {
    setSearch(val);
  };

  // Handlers for WordCard actions - These need Supabase implementation
  const [updatingWordId, setUpdatingWordId] = useState<string | null>(null);
  const [wordsState, setWordsState] = useState<AnalysisWord[]>([]);

  // Sync wordsState with fetched words
  React.useEffect(() => {
    setWordsState(words);
  }, [words]);

  const handleStatusChange = async (
    id: string,
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  ) => {
    // TODO: Implement Supabase version
    console.log("Status change:", { id, status });
    setUpdatingWordId(null);
  };

  const handleReloadDefinition = async (word: AnalysisWord) => {
    // TODO: Implement Supabase version
    console.log("Reload definition:", word.word);
  };

  const handleReloadTranslation = async (word: AnalysisWord) => {
    // TODO: Implement Supabase version
    console.log("Reload translation:", word.word);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Please sign in to view words
          </h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Error loading words
          </h1>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={refreshWords}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
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
    <div className="bg-gray-50 dark:bg-gray-900">
      <AnalysisWordsHeader analysis={analysis} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <WordFilterControls
          selectedStatuses={selectedStatuses}
          onStatusFilterChange={handleStatusFilterChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          search={search}
          onSearchChange={handleSearchChange}
          statusOptions={STATUS_OPTIONS}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          totalCount={
            analysis?.summary?.wordStats
              ? (Object.values(analysis.summary.wordStats) as number[]).reduce(
                  (a, b) => a + b,
                  0,
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
        {/* Simple pagination info - TODO: Implement proper Supabase pagination */}
        <div className="mt-8 flex items-center justify-center">
          <div className="text-sm text-gray-700">
            <span>
              Showing {words.length} words
              {analysis?.summary?.wordStats && (
                <span>
                  {" "}
                  of{" "}
                  {(
                    Object.values(analysis.summary.wordStats) as number[]
                  ).reduce((a, b) => a + b, 0)}{" "}
                  total
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

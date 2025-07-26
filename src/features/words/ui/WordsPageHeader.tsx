import React from "react";

import Link from "next/link";

import WordFilterControls from "@/shared/ui/WordFilterControls";

interface WordsPageHeaderProps {
  error: string | null;
  clearError: () => void;
  statusFilter: number[];
  search: string;
  setSearch: (search: string) => void;
  STATUS_OPTIONS: Array<{ value: number; label: string }>;
  analysesOptions: Array<{ value: string; label: string }>;
  selectedAnalyses: string[];
  setSelectedAnalyses: (analyses: string[]) => void;
  onStatusFilterChange: (statuses: (string | number)[]) => void;
}

export const WordsPageHeader: React.FC<WordsPageHeaderProps> = ({
  error,
  clearError,
  statusFilter,
  search,
  setSearch,
  STATUS_OPTIONS,
  analysesOptions,
  selectedAnalyses,
  setSelectedAnalyses,
  onStatusFilterChange,
}) => {
  return (
    <>
      {/* Header with Add Button */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Words
        </h1>
        <Link
          href="/words/add"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 hover:shadow-md"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Word
        </Link>
      </div>

      <WordFilterControls
        selectedStatuses={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        search={search}
        onSearchChange={setSearch}
        statusOptions={STATUS_OPTIONS}
        analysesOptions={analysesOptions}
        selectedAnalyses={selectedAnalyses}
        onAnalysesFilterChange={setSelectedAnalyses}
      />

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={clearError}
            className="mt-2 text-sm text-red-500 hover:text-red-700"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
};

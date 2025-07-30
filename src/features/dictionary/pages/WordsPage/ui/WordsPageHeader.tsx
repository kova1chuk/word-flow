import React from "react";

import Link from "next/link";

import { useSelector } from "react-redux";

import WordFilterControls from "@/shared/ui/WordFilterControls";

import { selectAvailableAnalyses } from "../../../model/selectors";

interface WordsPageHeaderProps {
  statusFilter: number[];
  search: string;
  setSearch: (search: string) => void;
  selectedAnalyses: string[];
  onStatusFilterChange: (statuses: number[]) => void;
  onAnalysesFilterChange: (analyses: string[]) => void;
  onSearch: () => void;
}

export const WordsPageHeader: React.FC<WordsPageHeaderProps> = ({
  statusFilter,
  search,
  setSearch,
  selectedAnalyses,
  onStatusFilterChange,
  onAnalysesFilterChange,
  onSearch,
}) => {
  const availableAnalyses = useSelector(selectAvailableAnalyses);

  return (
    <>
      {/* Header with Add Button */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Words
        </h1>
        <Link
          href="/dictionary/add"
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
        </Link>
      </div>

      <WordFilterControls
        availableAnalyses={availableAnalyses}
        selectedStatuses={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        search={search}
        onSearchChange={setSearch}
        selectedAnalyses={selectedAnalyses}
        onAnalysesFilterChange={onAnalysesFilterChange}
        onSearchButton={onSearch}
      />
    </>
  );
};

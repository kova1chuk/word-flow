import React, { useState, useEffect } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { colors } from "@/shared/config/colors";

interface StatusOption {
  value: string | number;
  label: string;
  color?: string;
}

interface AnalysisOption {
  value: string;
  label: string;
}

interface WordFilterControlsProps {
  selectedStatuses: (string | number)[];
  onStatusFilterChange: (selected: (string | number)[]) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusOptions: StatusOption[];
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  totalCount?: number;
  filteredCount?: number;
  className?: string;
  // New for analyses
  analysesOptions?: AnalysisOption[];
  selectedAnalyses?: string[];
  onAnalysesFilterChange?: (selected: string[]) => void;
}

const WordFilterControls: React.FC<WordFilterControlsProps> = ({
  selectedStatuses,
  onStatusFilterChange,
  search,
  onSearchChange,
  statusOptions,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
  totalCount,
  filteredCount,
  className = "",
  analysesOptions = [],
  selectedAnalyses = [],
  onAnalysesFilterChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const selectedStatusesSafe = selectedStatuses ?? [];
  const selectedAnalysesSafe = selectedAnalyses ?? [];

  const router = useRouter();
  const searchParams = useSearchParams();

  // On mount, initialize filters from URL
  useEffect(() => {
    const urlStatuses = searchParams.get("statuses");
    if (urlStatuses) {
      const parsed = urlStatuses
        .split(",")
        .map((v) => (isNaN(Number(v)) ? v : Number(v)));
      if (
        parsed.length > 0 &&
        JSON.stringify(parsed.sort()) !==
          JSON.stringify(selectedStatusesSafe.sort())
      ) {
        onStatusFilterChange(parsed);
      }
    }
    // Analyses
    const urlAnalyses = searchParams.get("analyses");
    if (urlAnalyses && onAnalysesFilterChange) {
      const parsed = urlAnalyses.split(",");
      if (
        parsed.length > 0 &&
        JSON.stringify(parsed.sort()) !==
          JSON.stringify(selectedAnalysesSafe.sort())
      ) {
        onAnalysesFilterChange(parsed);
      }
    }
  }, []);

  // On filter change, update URL
  useEffect(() => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (selectedStatusesSafe.length > 0) {
      params.set("statuses", selectedStatusesSafe.join(","));
    } else {
      params.delete("statuses");
    }
    if (selectedAnalysesSafe.length > 0) {
      params.set("analyses", selectedAnalysesSafe.join(","));
    } else {
      params.delete("analyses");
    }
    router.replace(`?${params.toString()}`);
  }, [selectedStatusesSafe, selectedAnalysesSafe]);

  // Compute all status values except 'all'
  const allStatusValues = statusOptions
    .filter((opt) => opt.value !== "all")
    .map((opt) => opt.value);
  const allSelected = allStatusValues.every((val) =>
    selectedStatusesSafe.includes(val)
  );

  // Handler for status button click
  const handleStatusClick = (value: string | number) => {
    if (value === "all") {
      if (allSelected) {
        // Deselect all
        onStatusFilterChange([]);
      } else {
        // Select all
        onStatusFilterChange(allStatusValues);
      }
      setShowFilters(false); // Close modal on select all
    } else {
      let newSelected = [...selectedStatusesSafe];
      if (selectedStatusesSafe.includes(value)) {
        newSelected = newSelected.filter((v) => v !== value);
      } else {
        newSelected.push(value);
      }
      // If after toggle all are selected, treat as 'all' selected
      if (allStatusValues.every((val) => newSelected.includes(val))) {
        onStatusFilterChange(allStatusValues);
      } else {
        onStatusFilterChange(newSelected);
      }
    }
  };

  // Handler to remove a single filter
  const handleRemoveFilter = (value: string | number) => {
    onStatusFilterChange(selectedStatusesSafe.filter((v) => v !== value));
  };

  // Analyses filter handlers
  const handleAnalysesClick = (value: string) => {
    if (!onAnalysesFilterChange) return;
    let newSelected = [...selectedAnalysesSafe];
    if (selectedAnalysesSafe.includes(value)) {
      newSelected = newSelected.filter((v) => v !== value);
    } else {
      newSelected.push(value);
    }
    onAnalysesFilterChange(newSelected);
  };
  const handleRemoveAnalysis = (value: string) => {
    if (!onAnalysesFilterChange) return;
    onAnalysesFilterChange(selectedAnalysesSafe.filter((v) => v !== value));
  };

  // Get selected status options (excluding 'all')
  const selectedStatusOptions = statusOptions.filter(
    (opt) =>
      opt.value !== "all" &&
      selectedStatusesSafe.includes(opt.value) &&
      !allSelected
  );
  // Get selected analyses options
  const selectedAnalysesOptions = analysesOptions.filter((opt) =>
    selectedAnalysesSafe.includes(opt.value)
  );

  return (
    <div className={`relative ${className}`}>
      {/* Background with unified dark theme */}
      <div
        className={`absolute inset-0 rounded-3xl border ${colors.border.light} dark:${colors.border.dark} ${colors.background.card.light} dark:${colors.background.card.dark} shadow-lg`}
      />

      {/* Main content */}
      <div className="relative p-0 sm:p-0 mb-8">
        {/* Controls Section */}
        <div className="relative w-full flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-3 p-0">
          {/* Search Input with Gear Icon */}
          <div className="w-full sm:flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search words..."
              className={
                `w-full pl-10 pr-12 py-3 rounded-3xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md focus:bg-white/90 dark:focus:bg-gray-900/80 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200 ` +
                `${colors.text.primary.light} dark:${colors.text.primary.dark} placeholder-gray-400 dark:placeholder-gray-500 ` +
                `shadow-lg text-base sm:text-lg outline-none`
              }
              style={{ fontWeight: 500 }}
            />
            {/* Vertical separator between input and filter button */}
            <span className="absolute right-11 top-1/2 -translate-y-1/2 h-7 w-px bg-gray-300 dark:bg-gray-700" />

            {/* Gear Icon Button */}
            <button
              onClick={() => setShowFilters(true)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                showFilters
                  ? "bg-blue-500 text-white shadow-lg"
                  : `${colors.background.card.dark} ${colors.text.muted.dark} hover:bg-gray-700 hover:text-gray-100`
              }`}
              title={showFilters ? "Hide filters" : "Show filters"}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>

          {/* Page Size Selector (if provided) */}
          {pageSizeOptions && onPageSizeChange && (
            <div className="flex items-center gap-2">
              <label
                className={`text-sm font-medium ${colors.text.primary.light} dark:${colors.text.primary.dark} whitespace-nowrap`}
              >
                Show:
              </label>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className={`px-3 py-2 rounded-lg border ${colors.border.light} dark:${colors.border.dark} ${colors.background.card.light} dark:${colors.background.card.dark} ${colors.text.primary.light} dark:${colors.text.primary.dark} focus:border-blue-400 focus:ring-2 focus:ring-blue-900/40 transition-all duration-200`}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Selected Filters as Chips */}
        {(selectedStatusOptions.length > 0 ||
          selectedAnalysesOptions.length > 0) && (
          <div className="flex flex-wrap gap-2 mt-3 mb-2">
            {selectedStatusOptions.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 font-medium text-sm shadow-sm"
              >
                {opt.label}
                <button
                  type="button"
                  onClick={() => handleRemoveFilter(opt.value)}
                  className="ml-2 text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 focus:outline-none"
                  title="Remove filter"
                >
                  ×
                </button>
              </span>
            ))}
            {selectedAnalysesOptions.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-200 font-medium text-sm shadow-sm"
              >
                {opt.label}
                <button
                  type="button"
                  onClick={() => handleRemoveAnalysis(opt.value)}
                  className="ml-2 text-green-400 hover:text-green-700 dark:hover:text-green-200 focus:outline-none"
                  title="Remove analysis filter"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Stats Display (if provided) */}
        {(totalCount !== undefined || filteredCount !== undefined) && (
          <div className="mb-4 text-center">
            <p
              className={`text-sm ${colors.text.muted.light} dark:${colors.text.muted.dark}`}
            >
              {totalCount !== undefined && filteredCount !== undefined
                ? `Showing ${filteredCount} of ${totalCount} words`
                : totalCount !== undefined
                ? `Total: ${totalCount} words`
                : `Showing: ${filteredCount} words`}
            </p>
          </div>
        )}

        {/* Filter Modal */}
        {showFilters && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md relative animate-in fade-in duration-200">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold focus:outline-none"
                onClick={() => setShowFilters(false)}
                title="Close"
              >
                ×
              </button>
              <h3 className="text-xl font-bold mb-2 text-center text-gray-800 dark:text-gray-100">
                Filter Words
              </h3>
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
                Filter by status and/or analyses. You can combine both filters
                for precise results.
              </p>
              <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 py-4">
                <div>
                  <h4 className="text-base font-semibold mb-2 text-gray-700 dark:text-gray-200">
                    By Status
                  </h4>
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4 w-full">
                    {statusOptions.map((option) => {
                      const isAllOption = option.value === "all";
                      const key = isAllOption ? "all" : String(option.value);
                      const selected = isAllOption
                        ? allSelected
                        : selectedStatusesSafe.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleStatusClick(option.value)}
                          className={getStatusButtonStyle(key, selected)}
                        >
                          <span
                            className="block w-full text-center"
                            style={{ lineHeight: 1.2 }}
                          >
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Analyses filter section */}
                {analysesOptions.length > 0 && onAnalysesFilterChange && (
                  <div>
                    <h4 className="text-base font-semibold mb-2 mt-6 text-gray-700 dark:text-gray-200">
                      By Analyses
                    </h4>
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 w-full">
                      {analysesOptions.map((option) => {
                        const selected = selectedAnalysesSafe.includes(
                          option.value
                        );
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleAnalysesClick(option.value)}
                            className={`px-4 py-2 rounded-xl border transition-all duration-200 font-semibold text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400/40 ${
                              selected
                                ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-200 border-green-400 dark:border-green-500 ring-2 ring-green-400/40 shadow-lg"
                                : "bg-white/10 dark:bg-gray-800/40 text-green-700 dark:text-green-200 border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusButtonStyle = (key: string, selected: boolean) => {
  // Map status keys to color config keys
  const statusKeyMap: Record<string, keyof typeof colors.statusFilters> = {
    all: "all",
    "1": "notLearned",
    "2": "beginner",
    "3": "basic",
    "4": "intermediate",
    "5": "advanced",
    "6": "wellKnown",
    "7": "mastered",
  };
  const colorKey = statusKeyMap[key] || "all";
  const color = colors.statusFilters[colorKey];
  return [
    "w-full flex items-center justify-center gap-2 py-3 px-6 my-1 rounded-2xl transition-all duration-200 text-lg shadow-md",
    color.border,
    color.text,
    color.bg,
    color.hover,
    color.accent,
    selected ? `${color.activeBg} ring-2 ring-blue-400/40 shadow-lg` : "",
    "backdrop-blur-md",
    "font-bold",
    "text-shadow-sm",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/40",
    "hover:scale-[1.03] active:scale-[0.98]",
    "cursor-pointer select-none",
  ].join(" ");
};

export default WordFilterControls;

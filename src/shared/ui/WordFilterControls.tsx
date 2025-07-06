import React from "react";

interface StatusOption {
  value: string | number;
  label: string;
}

interface WordFilterControlsProps {
  selectedStatuses: (string | number)[];
  onStatusFilterChange: (selected: (string | number)[]) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusOptions: StatusOption[];
  pageSizeOptions: number[];
  totalCount?: number;
  filteredCount?: number;
  className?: string;
}

const WordFilterControls: React.FC<WordFilterControlsProps> = ({
  selectedStatuses,
  onStatusFilterChange,
  pageSize,
  onPageSizeChange,
  search,
  onSearchChange,
  statusOptions,
  pageSizeOptions,
  totalCount,
  filteredCount,
  className = "",
}) => {
  const selectedStatusesSafe = selectedStatuses ?? [];

  // Helper to get count for each status
  const getCountForStatus = (value: string | number) => {
    if (value === "all") return totalCount ?? 0;
    // If you have per-status counts, you can pass them as a prop or compute here
    // For now, just return undefined (or 0)
    return undefined;
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 ${className}`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Words per page
            </label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex-1 flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-end">
          <div className="w-full sm:w-64">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search words..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          {typeof filteredCount === "number" &&
            typeof totalCount === "number" && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 sm:mt-0">
                {filteredCount} / {totalCount} words
              </div>
            )}
        </div>
      </div>
      {/* Status Multi-Select Button Group at the bottom */}
      <div className="flex flex-wrap gap-2 max-w-3xl mx-auto mt-6 justify-center">
        {statusOptions.map((option) => {
          const isAllOption = option.value === "all";
          const selected = isAllOption
            ? selectedStatusesSafe.length === 0
            : selectedStatusesSafe.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                if (isAllOption) {
                  // If "all" is clicked, clear all other selections
                  onStatusFilterChange([]);
                } else {
                  if (selected) {
                    onStatusFilterChange(
                      selectedStatusesSafe.filter((v) => v !== option.value)
                    );
                  } else {
                    onStatusFilterChange([
                      ...selectedStatusesSafe,
                      option.value,
                    ]);
                  }
                }
              }}
              className={`px-2 py-1 rounded-full text-sm font-medium transition-colors border
                ${
                  selected
                    ? "bg-blue-600 text-white border-blue-600 shadow"
                    : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-50"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-400`}
              style={{ minWidth: 64 }}
            >
              {option.label}
              {typeof getCountForStatus(option.value) === "number" && (
                <> ({getCountForStatus(option.value)})</>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WordFilterControls;

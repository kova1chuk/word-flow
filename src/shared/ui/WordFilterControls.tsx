import React from "react";

interface StatusOption {
  value: string | number;
  label: string;
}

interface WordFilterControlsProps {
  statusFilter: string | number;
  onStatusFilterChange: (value: string) => void;
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
  statusFilter,
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
          {/* Status Button Group */}
          <div className="flex flex-wrap gap-2 max-w-3xl mx-auto mb-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onStatusFilterChange(option.value.toString())}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === option.value
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={{ minWidth: 80 }}
              >
                {option.label}
                {typeof getCountForStatus(option.value) === "number" && (
                  <> ({getCountForStatus(option.value)})</>
                )}
              </button>
            ))}
          </div>
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
    </div>
  );
};

export default WordFilterControls;

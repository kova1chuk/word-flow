import React from "react";

import type { StatusOption, AnalysisOption } from "../types";

interface FilterChipsProps {
  selectedStatusOptions: StatusOption[];
  selectedAnalysesOptions: AnalysisOption[];
  onRemoveFilter: (value: string | number) => void;
  onRemoveAnalysis: (value: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  selectedStatusOptions,
  selectedAnalysesOptions,
  onRemoveFilter,
  onRemoveAnalysis,
}) => {
  if (
    selectedStatusOptions.length === 0 &&
    selectedAnalysesOptions.length === 0
  ) {
    return null;
  }

  return (
    <div className="mt-3 mb-2 flex flex-wrap gap-2">
      {selectedStatusOptions.map((opt) => (
        <span
          key={opt.value}
          className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-200"
        >
          {opt.label}
          <button
            type="button"
            onClick={() => onRemoveFilter(opt.value)}
            className="ml-2 text-blue-400 hover:text-blue-700 focus:outline-none dark:hover:text-blue-200"
            title="Remove filter"
          >
            ×
          </button>
        </span>
      ))}
      {selectedAnalysesOptions.map((opt) => (
        <span
          key={opt.value}
          className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 shadow-sm dark:bg-green-900/40 dark:text-green-200"
        >
          {opt.label}
          <button
            type="button"
            onClick={() => onRemoveAnalysis(opt.value)}
            className="ml-2 text-green-400 hover:text-green-700 focus:outline-none dark:hover:text-green-200"
            title="Remove analysis filter"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
};

import React from "react";

import { colors } from "@/shared/config/colors";

import { AnalysesForFilterResponse } from "../../../../entities/analysis/api/analysisApi";

import type { StatusOption } from "../types";

interface FilterModalProps {
  showFilters: boolean;
  onClose: () => void;
  statusOptions: StatusOption[];
  availableAnalyses: AnalysesForFilterResponse;
  selectedStatuses: number[];
  selectedAnalyses: string[];
  onStatusClick: (value: number) => void;
  onAnalysesFilterClick?: (selected: string) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  showFilters,
  onClose,
  statusOptions,
  availableAnalyses,
  selectedStatuses,
  selectedAnalyses,
  onStatusClick,
  onAnalysesFilterClick,
}) => {
  if (!showFilters) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="animate-in fade-in relative w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl duration-200 dark:bg-gray-900">
        <button
          className="absolute top-2 right-2 text-xl font-bold text-gray-400 hover:text-gray-700 focus:outline-none dark:hover:text-gray-200"
          onClick={onClose}
          title="Close"
        >
          ×
        </button>
        <h3 className="mb-1 text-center text-lg font-bold text-gray-800 dark:text-gray-100">
          Filter Words
        </h3>
        <p className="mb-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Filter by status and/or analyses. You can combine both filters for
          precise results.
        </p>
        <div className="space-y-3 px-1 py-2 sm:space-y-4 sm:px-2">
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              By Status
            </h4>
            <div className="flex w-full flex-wrap justify-center gap-2 sm:gap-3">
              {statusOptions.map((option) => {
                const key = String(option.value);
                const selected = selectedStatuses.includes(
                  Number(option.value),
                );
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onStatusClick(Number(option.value))}
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
          {availableAnalyses.length > 0 && onAnalysesFilterClick && (
            <div>
              <h4 className="mt-4 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                By Analyses
              </h4>
              <div className="flex w-full flex-wrap justify-center gap-2 sm:gap-3">
                {availableAnalyses.map((option) => {
                  const selected = selectedAnalyses.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onAnalysesFilterClick(option.id)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-semibold shadow-sm transition-all duration-200 focus:ring-2 focus:ring-green-400/40 focus:outline-none ${
                        selected
                          ? "border-green-400 bg-green-100 text-green-700 shadow-lg ring-2 ring-green-400/40 dark:border-green-500 dark:bg-green-900/40 dark:text-green-200"
                          : "border-green-300 bg-white/10 text-green-700 hover:bg-green-50 dark:border-green-700 dark:bg-gray-800/40 dark:text-green-200 dark:hover:bg-green-900/30"
                      }`}
                    >
                      {option.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getStatusButtonStyle = (key: string, selected: boolean) => {
  // Map status keys to color config keys
  const statusKeyMap: Record<string, keyof typeof colors.statusFilters> = {
    "1": "notLearned",
    "2": "beginner",
    "3": "basic",
    "4": "intermediate",
    "5": "advanced",
    "6": "wellKnown",
    "7": "mastered",
  };
  const colorKey = statusKeyMap[key] || "notLearned";
  const color = colors.statusFilters[colorKey];
  return [
    "w-full flex items-center justify-center gap-1 py-2 px-4 my-0.5 rounded-xl transition-all duration-200 text-sm shadow-md",
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
    "hover:scale-[1.02] active:scale-[0.98]",
    "cursor-pointer select-none",
  ].join(" ");
};

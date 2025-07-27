import React from "react";

import { colors } from "@/shared/config/colors";

interface SearchInputProps {
  search: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  search,
  onSearchChange,
  showFilters,
  onToggleFilters,
}) => {
  return (
    <div className="relative w-full sm:flex-1">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-gray-500">
        <svg
          className="h-5 w-5"
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
          `w-full rounded-2xl bg-white/70 py-3 pr-12 pl-6 backdrop-blur-md transition-all duration-200 focus:bg-white/90 focus:ring-2 focus:ring-blue-400/30 dark:bg-gray-800/70 dark:focus:bg-gray-900/80 ` +
          `${colors.text.primary.light} dark:${colors.text.primary.dark} placeholder-gray-400 dark:placeholder-gray-500` +
          `text-base shadow-lg outline-none sm:text-lg`
        }
        style={{ fontWeight: 500 }}
      />
      {/* Vertical separator between input and filter button */}
      <span className="absolute top-1/2 right-11 h-7 w-px -translate-y-1/2 bg-gray-300 dark:bg-gray-700" />

      {/* Gear Icon Button */}
      <button
        onClick={onToggleFilters}
        className={`absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-2 transition-all duration-200 ${
          showFilters
            ? "bg-blue-500 text-white shadow-lg"
            : `${colors.background.card.dark} ${colors.text.muted.dark} hover:bg-gray-700 hover:text-gray-100`
        }`}
        title={showFilters ? "Hide filters" : "Show filters"}
      >
        <svg
          className="h-5 w-5"
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
  );
};

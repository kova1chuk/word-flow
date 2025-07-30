import React, { useState } from "react";

import { colors } from "@/shared/config/colors";

import { AnalysesForFilterResponse } from "../../../entities/analysis/api/analysisApi";

import { FilterModal } from "./components/FilterModal";
import { SearchInput } from "./components/SearchInput";
import type { StatusOption } from "./types";

// Static status options
const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 1,
    label: "Not Learned",
    color: colors.statusFilters.notLearned.text,
  },
  { value: 2, label: "Beginner", color: colors.statusFilters.beginner.text },
  { value: 3, label: "Basic", color: colors.statusFilters.basic.text },
  {
    value: 4,
    label: "Intermediate",
    color: colors.statusFilters.intermediate.text,
  },
  { value: 5, label: "Advanced", color: colors.statusFilters.advanced.text },
  { value: 6, label: "Well Known", color: colors.statusFilters.wellKnown.text },
  { value: 7, label: "Mastered", color: colors.statusFilters.mastered.text },
];

export interface WordFilterControlsProps {
  className?: string;
  search: string;
  availableAnalyses?: AnalysesForFilterResponse;
  selectedStatuses: number[];
  selectedAnalyses?: string[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (selected: number[]) => void;
  onAnalysesFilterChange?: (selected: string[]) => void;
  onSearchButton: () => void;
}

const WordFilterControls: React.FC<WordFilterControlsProps> = ({
  selectedStatuses,
  onStatusFilterChange,
  search,
  onSearchChange,
  className = "",
  availableAnalyses = [],
  selectedAnalyses = [],
  onAnalysesFilterChange,
  onSearchButton,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleStatusClick = (value: number) => {
    let newSelected = [...selectedStatuses];
    if (selectedStatuses.includes(value)) {
      newSelected = newSelected.filter((v) => v !== value);
    } else {
      newSelected.push(value);
    }
    onStatusFilterChange(newSelected);
  };

  const handleAnalysesFilterClick = (value: string) => {
    if (!onAnalysesFilterChange) return;

    let newSelected = [...selectedAnalyses];
    if (selectedAnalyses.includes(value)) {
      newSelected = newSelected.filter((v) => v !== value);
    } else {
      newSelected.push(value);
    }
    onAnalysesFilterChange(newSelected);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Background with unified dark theme */}
      <div
        className={`absolute inset-0 rounded-3xl border ${colors.border.light} dark:${colors.border.dark} ${colors.background.card.light} dark:${colors.background.card.dark} shadow-lg`}
      />

      {/* Main content */}
      <div className="relative mb-8 p-0 sm:p-0">
        {/* Controls Section */}
        <div className="relative flex w-full flex-col gap-3 p-0 sm:flex-row sm:items-center sm:gap-6">
          <SearchInput
            search={search}
            onSearchChange={onSearchChange}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onSearchButton={onSearchButton}
          />
        </div>

        <FilterModal
          showFilters={showFilters}
          onClose={() => setShowFilters(false)}
          statusOptions={STATUS_OPTIONS}
          availableAnalyses={availableAnalyses}
          selectedStatuses={selectedStatuses}
          selectedAnalyses={selectedAnalyses}
          onStatusClick={handleStatusClick}
          onAnalysesFilterClick={handleAnalysesFilterClick}
        />
      </div>
    </div>
  );
};

export default WordFilterControls;

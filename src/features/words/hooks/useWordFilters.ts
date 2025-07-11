import { useState, useEffect, useMemo } from "react";

import type { Word } from "@/types";

export function useWordFilters(words: Word[]) {
  const [statusFilter, setStatusFilter] = useState<(string | number)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [search, setSearch] = useState("");

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

  const filteredWords = useMemo(() => {
    return words
      .filter((word) => {
        if (statusFilter.length === 0) return true; // Show all if none selected
        if (statusFilter.includes("unset")) return !word.status;
        return word.status !== undefined && statusFilter.includes(word.status);
      })
      .filter((word) =>
        search.trim() === ""
          ? true
          : word.word.toLowerCase().includes(search.trim().toLowerCase())
      );
  }, [words, statusFilter, search]);

  // Pagination logic
  const totalPages = Math.ceil(filteredWords.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentWords = filteredWords.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    goToPage(currentPage - 1);
  };

  const goToNextPage = () => {
    goToPage(currentPage + 1);
  };

  return {
    // Filter state
    statusFilter,
    setStatusFilter,
    search,
    setSearch,

    // Pagination state
    currentPage,
    pageSize,
    setPageSize,
    totalPages,

    // Computed values
    filteredWords,
    currentWords,

    // Actions
    goToPage,
    goToPreviousPage,
    goToNextPage,

    // Options
    STATUS_OPTIONS,
    PAGE_SIZE_OPTIONS,
  };
}

import { useState, useEffect } from "react";

export function useWordFilters() {
  const [statusFilter, setStatusFilter] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [search, setSearch] = useState("");

  const STATUS_OPTIONS = [
    { value: 0, label: "All Statuses" },
    { value: 1, label: "Not Learned" },
    { value: 2, label: "Beginner" },
    { value: 3, label: "Basic" },
    { value: 4, label: "Intermediate" },
    { value: 5, label: "Advanced" },
    { value: 6, label: "Well Known" },
    { value: 7, label: "Mastered" },
  ];

  const PAGE_SIZE_OPTIONS = [6, 12, 24, 48];

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, page));
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
    setCurrentPage,
    setPageSize,
    totalPages: 0, // Will be calculated from RTK store

    // Actions
    goToPage,
    goToPreviousPage,
    goToNextPage,

    // Options
    STATUS_OPTIONS,
    PAGE_SIZE_OPTIONS,
  };
}

import { useState } from "react";

export function useWordFilters() {
  const [statusFilter, setStatusFilter] = useState<number[]>([]);
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

  return {
    // Filter state
    statusFilter,
    setStatusFilter,
    search,
    setSearch,

    // Options
    STATUS_OPTIONS,
    PAGE_SIZE_OPTIONS,
  };
}

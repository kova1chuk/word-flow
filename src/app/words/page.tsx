"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuthSync } from "@/shared/hooks/useAuthSync";
import { useWordsRTK } from "@/features/words/lib/useWordsRTK";
import { useWordFilters } from "@/features/words/lib/useWordFilters";
import { WordsListRTK } from "@/features/words/components/WordsListRTK";
import WordFilterControls from "@/shared/ui/WordFilterControls";
import Pagination from "@/shared/ui/Pagination";
import { LoadingSpinner } from "@/shared/ui/LoadingSpinner";
import type { Word } from "@/types";

export default function WordsPage() {
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuthSync();
  const { error, pagination, fetchWords, clearError, setCurrentPage } =
    useWordsRTK();

  const {
    currentPage,
    pageSize,
    statusFilter,
    search,
    setCurrentPage: setFilterPage,
    setPageSize: setFilterPageSize,
    setStatusFilter,
    setSearch,
    STATUS_OPTIONS,
    PAGE_SIZE_OPTIONS,
  } = useWordFilters();

  const lastFetchRef = useRef<string>("");

  // Handle SSR
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync current page between hooks only once
  useEffect(() => {
    if (isClient) {
      setCurrentPage(currentPage);
    }
  }, [currentPage, setCurrentPage, isClient]);

  // Fetch words when dependencies change
  useEffect(() => {
    if (!isClient || !user?.uid) return;

    const fetchKey = `${user.uid}-${currentPage}-${pageSize}-${JSON.stringify(
      statusFilter
    )}`;

    // Only fetch if the key has changed
    if (lastFetchRef.current !== fetchKey) {
      lastFetchRef.current = fetchKey;
      fetchWords(user.uid, currentPage, pageSize, statusFilter);
    }
  }, [isClient, user?.uid, currentPage, pageSize, statusFilter]);

  const handleWordAction = (action: string, _word: Word) => {
    if (!user?.uid) return;

    switch (action) {
      case "delete":
        // Handle delete action
        // TODO: Implement delete functionality
        break;
      case "reload-definition":
        // Handle reload definition action
        // TODO: Implement reload definition functionality
        break;
      case "reload-translation":
        // Handle reload translation action
        // TODO: Implement reload translation functionality
        break;
      case "update-status":
        // Handle update status action
        // TODO: Implement update status functionality
        break;
      default:
        break;
    }
  };

  const handlePageChange = (page: number) => {
    setFilterPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setFilterPageSize(size);
  };

  const handleStatusFilterChange = (statuses: (string | number)[]) => {
    // Convert string values to numbers for the filter
    const numericStatuses = statuses
      .map((s) => (typeof s === "string" ? parseInt(s) : s))
      .filter((s) => !isNaN(s as number)) as number[];
    setStatusFilter(numericStatuses);
    setFilterPage(1); // Reset to first page when filter changes
  };

  const handleSearchChange = (searchTerm: string) => {
    setSearch(searchTerm);
    setFilterPage(1); // Reset to first page when search changes
  };

  // Calculate total pages
  const totalPages = Math.ceil(pagination.totalWords / pageSize);

  // Show loading during SSR or when not on client
  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <WordFilterControls
        selectedStatuses={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        search={search}
        onSearchChange={handleSearchChange}
        statusOptions={STATUS_OPTIONS}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        totalCount={pagination.totalWords}
        filteredCount={pagination.totalWords}
      />

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
          <button
            onClick={clearError}
            className="mt-2 text-sm text-red-500 hover:text-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      <WordsListRTK
        currentPage={currentPage}
        pageSize={pageSize}
        onWordAction={handleWordAction}
      />

      {/* Pagination */}
      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mb-4"
        />

        {/* Page info */}
        <div className="text-center text-sm text-gray-600">
          Page {currentPage} of {totalPages} • {pagination.totalWords} total
          words
        </div>
      </div>
    </div>
  );
}

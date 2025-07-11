"use client";

import React, { useEffect, useState, useTransition, useCallback } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { useSelector, useDispatch } from "react-redux";

import { WordsListRTKSkeleton } from "@/features/words/components/WordsListRTKSkeleton";
import { WordsListRTKWithSuspense } from "@/features/words/components/WordsListRTKWithSuspense";
import { useWordFilters } from "@/features/words/lib/useWordFilters";
import { useWordsRTK } from "@/features/words/lib/useWordsRTK";
import { selectPaginatedWords } from "@/features/words/model/selectors";
import {
  reloadDefinition,
  reloadTranslation,
  deleteWord,
  updateWordStatus,
  setUpdating,
  fetchWordsPage,
  clearWords,
} from "@/features/words/model/wordsSlice";

import { useAuthSync } from "@/shared/hooks/useAuthSync";
import type { RootState, AppDispatch } from "@/shared/model/store";
import { LoadingSpinner } from "@/shared/ui/LoadingSpinner";
import Pagination from "@/shared/ui/Pagination";
import WordFilterControls from "@/shared/ui/WordFilterControls";

import type { Word } from "@/types";

// Custom hook for debounced search
const useDebouncedSearch = (search: string, delay: number = 500) => {
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, delay);

    return () => clearTimeout(timer);
  }, [search, delay]);

  return debouncedSearch;
};

export default function WordsPage() {
  const { user } = useAuthSync();
  const dispatch = useDispatch<AppDispatch>();
  const { error, clearError } = useWordsRTK();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [isPageLoading, setIsPageLoading] = useState(false);

  const { statusFilter, search, setStatusFilter, setSearch, STATUS_OPTIONS } =
    useWordFilters();

  // Use debounced search to avoid too many API calls
  const debouncedSearch = useDebouncedSearch(search, 500);

  // Get current page from URL params
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 20;

  // Update URL when page changes
  const handlePageChange = useCallback(
    (page: number) => {
      // Don't do anything if we're already on this page
      if (page === currentPage) return;

      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Update URL using the simple approach
      const params = new URLSearchParams();
      if (page > 1) params.set("page", page.toString());
      router.push(`?${params.toString()}`);
    },
    [currentPage, router]
  );

  // Update URL when filters change (separate function to avoid recursion)
  const updateURLForFilters = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      if (page > 1) params.set("page", page.toString());
      router.push(`?${params.toString()}`);
    },
    [router]
  );

  // Reset page to 1 and clear words when filters change
  useEffect(() => {
    // Only reset page if we're not on page 1 and filters have changed
    if (currentPage !== 1) {
      updateURLForFilters(1);
    }
    // Clear words when status filter changes to ensure fresh data
    dispatch(clearWords());
  }, [statusFilter, dispatch, updateURLForFilters, currentPage]);

  // Handle search changes with transition and clear words
  useEffect(() => {
    // Only reset page if we're not on page 1 and search has changed
    if (currentPage !== 1) {
      startTransition(() => {
        updateURLForFilters(1);
      });
    }
    // Clear words when search changes to ensure fresh data
    // Use a small delay to ensure the clear operation completes
    const timeoutId = setTimeout(() => {
      dispatch(clearWords());
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [debouncedSearch, dispatch, updateURLForFilters, currentPage]);

  // Fetch words from Firestore with filters (use debounced search)
  useEffect(() => {
    if (!user?.uid) return;

    setIsPageLoading(true);
    dispatch(
      fetchWordsPage({
        userId: user.uid,
        page: currentPage,
        pageSize,
        statusFilter,
        search: debouncedSearch,
      })
    ).finally(() => {
      // Add a small delay to ensure the loading state is visible
      setTimeout(() => {
        setIsPageLoading(false);
      }, 300);
    });
  }, [
    user?.uid,
    currentPage,
    pageSize,
    statusFilter,
    debouncedSearch,
    dispatch,
  ]);

  // Get pagination info from Redux
  const { totalPages, total, words } = useSelector((state: RootState) =>
    selectPaginatedWords(state, { page: currentPage, pageSize })
  );
  const pagination = useSelector((state: RootState) => state.words.pagination);

  // Show pagination when there are words and either multiple pages or more data to load
  const shouldShowPagination = total > pageSize || pagination.hasMore;

  // Handle word actions (like status changes)
  const handleWordAction = async (
    action: string,
    word: Word,
    data?: unknown
  ) => {
    if (!user?.uid) return;

    try {
      switch (action) {
        case "reload-definition":
          dispatch(setUpdating(word.id));
          await dispatch(reloadDefinition({ word })).unwrap();
          break;

        case "reload-translation":
          dispatch(setUpdating(word.id));
          await dispatch(reloadTranslation({ word })).unwrap();
          break;

        case "delete":
          if (confirm(`Are you sure you want to delete "${word.word}"?`)) {
            await dispatch(
              deleteWord({ wordId: word.id, userId: user.uid })
            ).unwrap();
            // Refresh the words list after deletion
            dispatch(
              fetchWordsPage({
                userId: user.uid,
                page: currentPage,
                pageSize,
                statusFilter,
                search: debouncedSearch,
              })
            );
          }
          break;

        case "update-status":
          const newStatus = data as 1 | 2 | 3 | 4 | 5 | 6 | 7;
          if (newStatus && newStatus >= 1 && newStatus <= 7) {
            dispatch(setUpdating(word.id));
            await dispatch(
              updateWordStatus({
                wordId: word.id,
                status: newStatus,
                userId: user.uid,
                words,
              })
            ).unwrap();
          }
          break;

        default:
          console.warn("Unknown action:", action);
      }
    } catch (error) {
      console.error("Error performing word action:", error);
    } finally {
      dispatch(setUpdating(null));
    }
  };

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
        onStatusFilterChange={(statuses) => {
          // Convert string values to numbers for the filter
          const numericStatuses = statuses
            .map((s) => (typeof s === "string" ? parseInt(s) : s))
            .filter((s) => !isNaN(s as number)) as number[];
          setStatusFilter(numericStatuses);
        }}
        search={search}
        onSearchChange={setSearch}
        statusOptions={STATUS_OPTIONS}
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

      {/* Show skeleton loading during page transitions */}
      {isPageLoading ? (
        <WordsListRTKSkeleton count={pageSize} />
      ) : (
        <WordsListRTKWithSuspense
          currentPage={currentPage}
          pageSize={pageSize}
          onWordAction={handleWordAction}
        />
      )}

      {/* Pagination */}
      {shouldShowPagination && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages || Math.ceil(total / pageSize) || 1}
            onPageChange={handlePageChange}
            className="mb-4"
          />

          {/* Page info */}
          <div className="text-center text-sm text-gray-600">
            {totalPages ? (
              <>
                Page {currentPage} of {totalPages} • {total} total words
              </>
            ) : (
              <>
                Page {currentPage} • {total} words found
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

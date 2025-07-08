"use client";

import React, { useEffect, useState } from "react";
import { useAuthSync } from "@/shared/hooks/useAuthSync";
import { useWordsRTK } from "@/features/words/lib/useWordsRTK";
import { useWordFilters } from "@/features/words/lib/useWordFilters";
import WordFilterControls from "@/shared/ui/WordFilterControls";
import { LoadingSpinner } from "@/shared/ui/LoadingSpinner";
import { useSelector, useDispatch } from "react-redux";
import type { Word } from "@/types";
import type { RootState, AppDispatch } from "@/shared/model/store";
import { WordsListRTKWithSuspense } from "@/features/words/components/WordsListRTKWithSuspense";
import Pagination from "@/shared/ui/Pagination";
import {
  reloadDefinition,
  reloadTranslation,
  deleteWord,
  updateWordStatus,
  setUpdating,
  fetchWordsPage,
} from "@/features/words/model/wordsSlice";

export default function WordsPage() {
  const { user } = useAuthSync();
  const dispatch = useDispatch<AppDispatch>();
  const { error, clearError } = useWordsRTK();

  const { statusFilter, search, setStatusFilter, setSearch, STATUS_OPTIONS } =
    useWordFilters();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Fetch words from Firestore with filters
  useEffect(() => {
    if (!user?.uid) return;
    dispatch(
      fetchWordsPage({
        userId: user.uid,
        page: currentPage,
        pageSize,
        statusFilter,
        search,
      })
    );
  }, [user?.uid, currentPage, pageSize, statusFilter, search, dispatch]);

  // Get pagination info from Redux
  const pagination = useSelector((state: RootState) => state.words.pagination);
  const words = useSelector((state: RootState) => state.words.words) as Word[];

  // Calculate pagination
  const totalPages = Math.ceil((pagination?.totalWords || 0) / pageSize);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
                search,
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

      <WordsListRTKWithSuspense
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
          Page {currentPage} of {totalPages} • {pagination?.totalWords || 0}{" "}
          total words
        </div>
      </div>
    </div>
  );
}

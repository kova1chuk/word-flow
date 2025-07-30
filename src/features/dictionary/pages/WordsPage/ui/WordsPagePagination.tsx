import React from "react";

import Pagination from "@/shared/ui/Pagination";

interface WordsPagePaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const WordsPagePagination: React.FC<WordsPagePaginationProps> = ({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
}) => {
  return (
    <div className="mt-8">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages || Math.ceil(total / pageSize) || 1}
        onPageChange={onPageChange}
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
  );
};

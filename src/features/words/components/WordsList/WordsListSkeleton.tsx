import React from "react";

interface WordsListSkeletonProps {
  count?: number;
}

export const WordsListSkeleton: React.FC<WordsListSkeletonProps> = ({
  count = 3,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative mx-auto mb-6 w-full max-w-2xl animate-pulse rounded-xl bg-white p-4 shadow-md sm:p-6 dark:bg-gray-800"
        >
          {/* Word and status section */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              {/* Word skeleton */}
              <div className="mb-2 h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              {/* Phonetic skeleton */}
              <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
            {/* Delete button skeleton */}
            <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          </div>

          <div className="space-y-4">
            {/* Definition section skeleton */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-4/6 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>

            {/* Translation section skeleton */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>

            {/* Status section skeleton */}
            <div className="mb-4">
              <div className="mb-2 h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700"
                  ></div>
                ))}
              </div>
            </div>

            {/* Examples section skeleton */}
            <div>
              <div className="mb-2 h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="space-y-3">
                <div className="rounded bg-gray-100 p-3 dark:bg-gray-700">
                  <div className="mb-1 h-3 w-full rounded bg-gray-200 dark:bg-gray-600"></div>
                  <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-600"></div>
                </div>
                <div className="rounded bg-gray-100 p-3 dark:bg-gray-700">
                  <div className="mb-1 h-3 w-full rounded bg-gray-200 dark:bg-gray-600"></div>
                  <div className="h-3 w-4/6 rounded bg-gray-200 dark:bg-gray-600"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

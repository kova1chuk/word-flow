import React from "react";

interface WordsListRTKSkeletonProps {
  count?: number;
}

export const WordsListRTKSkeleton: React.FC<WordsListRTKSkeletonProps> = ({
  count = 3,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 w-full max-w-2xl mx-auto mb-6 relative animate-pulse"
        >
          {/* Word and status section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div className="flex-1 min-w-0">
              {/* Word skeleton */}
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
              {/* Phonetic skeleton */}
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            {/* Delete button skeleton */}
            <div className="absolute top-2 right-2 w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>

          <div className="space-y-4">
            {/* Definition section skeleton */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
              </div>
            </div>

            {/* Translation section skeleton */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>

            {/* Status section skeleton */}
            <div className="mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"
                  ></div>
                ))}
              </div>
            </div>

            {/* Examples section skeleton */}
            <div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

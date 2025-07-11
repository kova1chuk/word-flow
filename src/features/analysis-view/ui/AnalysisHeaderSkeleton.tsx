export const AnalysisHeaderSkeleton: React.FC = () => {
  return (
    <div className="mb-8">
      {/* Back Navigation Skeleton */}
      <div className="mb-6">
        <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Title Section Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="space-y-4">
              {/* Title Skeleton */}
              <div className="w-3/4 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

              {/* Date Skeleton */}
              <div className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface WordStatsChartSkeletonProps {
  showError?: boolean;
}

export default function WordStatsChartSkeleton({
  showError = false,
}: WordStatsChartSkeletonProps) {
  if (showError) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-200 dark:bg-red-800 rounded-full mx-auto mb-4 animate-pulse"></div>
        <div className="h-4 bg-red-200 dark:bg-red-800 rounded w-48 mx-auto mb-2 animate-pulse"></div>
        <div className="h-3 bg-red-100 dark:bg-red-900 rounded w-32 mx-auto animate-pulse"></div>
      </div>
    );
  }

  return (
    <>
      {/* Chart skeleton */}
      <div
        className="flex justify-center items-center"
        style={{ minHeight: 400 }}
      >
        <div className="w-full max-w-lg h-96">
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-center">
              {/* Doughnut chart skeleton */}
              <div className="relative w-64 h-64 mx-auto mb-4">
                <div className="w-full h-full bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                <div className="absolute inset-8 bg-white dark:bg-gray-800 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 mx-auto animate-pulse"></div>
                  </div>
                </div>
              </div>
              {/* Title skeleton */}
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-40 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend skeleton */}
      <div className="flex flex-wrap justify-center gap-2 mt-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-4 max-w-2xl mx-auto border border-gray-200 dark:border-gray-700">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
          </div>
        ))}
      </div>
    </>
  );
}

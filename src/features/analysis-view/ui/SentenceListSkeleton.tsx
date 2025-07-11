export const SentenceListSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-4 p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
        >
          {/* Sentence Number Skeleton */}
          <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />

          {/* Content Skeleton */}
          <div className="flex-1 space-y-3">
            {/* Sentence Text Skeleton */}
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>

            {/* Translation Skeleton */}
            <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

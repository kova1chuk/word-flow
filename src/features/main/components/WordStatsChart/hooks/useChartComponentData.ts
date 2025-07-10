import { useUserStatsRTK } from "@/shared/hooks/useUserStatsRTK";

// Simple cache for promises
const promiseCache = new Map<
  string,
  Promise<{ statusCounts: number[]; error: string | null }>
>();

export function useChartComponentData() {
  const { wordStats, error, loading } = useUserStatsRTK();

  // Create a unique key for this data
  const cacheKey = `chart-data-${JSON.stringify(wordStats)}-${loading}`;

  // If loading, throw a promise to trigger Suspense
  if (loading) {
    let promise = promiseCache.get(cacheKey);

    if (!promise) {
      // Create a promise that resolves when loading is complete
      promise = new Promise<{ statusCounts: number[]; error: string | null }>(
        (resolve) => {
          // Use a simple polling mechanism without setTimeout
          const checkData = () => {
            // Check if we have data by looking at wordStats
            if (wordStats !== null) {
              const statusCounts = [1, 2, 3, 4, 5, 6, 7].map(
                (s) => wordStats?.[s] ?? 0
              );
              resolve({ statusCounts, error });
              promiseCache.delete(cacheKey);
            } else {
              // Use requestAnimationFrame for better performance
              requestAnimationFrame(checkData);
            }
          };

          requestAnimationFrame(checkData);
        }
      );

      promiseCache.set(cacheKey, promise);
    }

    throw promise;
  }

  // Data is ready, return immediately
  const statusCounts = [1, 2, 3, 4, 5, 6, 7].map((s) => wordStats?.[s] ?? 0);
  return { statusCounts, error };
}

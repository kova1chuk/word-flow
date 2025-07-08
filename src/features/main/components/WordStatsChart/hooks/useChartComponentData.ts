import { useUserStats } from "@/shared/hooks/useUserStats";
import { createDataResource } from "./cache";

export function useChartComponentData() {
  const { wordStats, error, loading } = useUserStats();

  // Create a unique key for this data
  const cacheKey = `chart-data-${JSON.stringify(wordStats)}-${loading}`;

  // Create data resource that will suspend while loading
  const dataResource = createDataResource(cacheKey, async () => {
    // Simulate async operation only when loading is true
    if (loading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Prepare chart data (current snapshot)
    const statusCounts = [1, 2, 3, 4, 5, 6, 7].map((s) => wordStats?.[s] ?? 0);

    return { statusCounts, error, loading };
  });

  // This will throw a promise if data is not ready, causing Suspense to show fallback
  const { statusCounts } = dataResource.read();

  return { statusCounts, error };
}

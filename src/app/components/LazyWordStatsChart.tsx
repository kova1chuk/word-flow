"use client";

import { Suspense, lazy } from "react";
import WordStatsChartSkeleton from "./WordStatsChartSkeleton";

// Lazy load the WordStatsChart component
const WordStatsChart = lazy(() => import("./WordStatsChart"));

interface LazyWordStatsChartProps {
  statusCounts: number[];
  loading: boolean;
  error: string | null;
}

export default function LazyWordStatsChart({
  statusCounts,
  loading,
  error,
}: LazyWordStatsChartProps) {
  // Show error skeleton if there's an error
  if (error) {
    return <WordStatsChartSkeleton showError={true} />;
  }

  // Show loading skeleton if still loading
  if (loading) {
    return <WordStatsChartSkeleton />;
  }

  return (
    <Suspense fallback={<WordStatsChartSkeleton />}>
      <WordStatsChart
        statusCounts={statusCounts}
        loading={loading}
        error={error}
      />
    </Suspense>
  );
}

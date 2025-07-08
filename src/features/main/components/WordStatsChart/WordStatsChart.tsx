"use client";

import { Suspense, lazy } from "react";
import WordStatsChartSkeleton from "./WordStatsChartSkeleton";
import "./chartConfig";

// Lazy load the Chart component
const ChartComponent = lazy(() => import("./ChartComponent"));

export default function WordStatsChart() {
  // Let Suspense handle all loading states
  return (
    <Suspense fallback={<WordStatsChartSkeleton />}>
      <ChartComponent />
    </Suspense>
  );
}

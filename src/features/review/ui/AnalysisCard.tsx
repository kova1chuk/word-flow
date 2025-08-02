import { useState } from "react";

import Link from "next/link";

import { useSelector } from "react-redux";

import { LearningOverview } from "@/components/LearningOverview";

import { selectUser } from "@/entities/user/model/selectors";

import { Analysis } from "../lib/analysesApi";

interface AnalysisCardProps {
  analysis: Analysis;
  onRefresh?: () => void;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  onRefresh,
}) => {
  const user = useSelector(selectUser);
  const [isReloading, setIsReloading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleReload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || isReloading) return;

    setIsReloading(true);
    try {
      // TODO: Implement Supabase analysis stats update
      console.log("Would update analysis stats for:", analysis.id);
      onRefresh?.();
    } catch (error) {
      console.error("Error reloading stats:", error);
    } finally {
      setIsReloading(false);
    }
  };

  // Calculate completeness from statusCounts using weighted average
  function calculateCompletenessFromCounts(
    counts: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, number>,
  ): number {
    if (!counts) return 0;
    // Only allow keys 1-7, and avoid TS error by explicit typing
    const arr = Array.from(
      { length: 7 },
      (_, i) => counts[(i + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7] || 0,
    );
    const total = arr.reduce((a, b) => a + b, 0);
    if (total === 0) return 0;

    // Calculate weighted score where status 7 = 100%, status 1 = 0%
    // Each status represents progress: 1=0%, 2=16.7%, 3=33.3%, 4=50%, 5=66.7%, 6=83.3%, 7=100%
    const weighted = arr.reduce((sum, count, i) => {
      const statusProgress = (i / 6) * 100; // Status 1 (i=0) = 0%, Status 7 (i=6) = 100%
      return sum + count * statusProgress;
    }, 0);

    return Math.round(weighted / total);
  }

  // Calculate completion percentage from statusCounts
  const completionPercentage = Math.round(
    calculateCompletenessFromCounts(analysis.wordsStat),
  );

  return (
    <Link href={`/reviews/${analysis.id}`}>
      <div className="group relative flex h-full transform flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-500 hover:scale-[1.02] hover:border-blue-300 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600">
        {/* Enhanced Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/60 opacity-0 transition-all duration-500 group-hover:opacity-100 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-purple-900/30" />

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        </div>

        {/* Enhanced Reload Button */}
        <button
          onClick={handleReload}
          disabled={isReloading}
          className="absolute top-4 right-4 z-20 rounded-xl border border-gray-200/50 bg-white/90 p-3 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:bg-white hover:shadow-xl disabled:opacity-50 dark:border-gray-600/50 dark:bg-gray-700/90 dark:hover:bg-gray-700"
          title="Reload statistics"
        >
          <svg
            className={`h-4 w-4 text-gray-600 dark:text-gray-400 ${
              isReloading ? "animate-spin" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="relative z-10">
          {/* Enhanced Header */}
          <div className="mb-6">
            <h3 className="mb-3 line-clamp-2 pr-16 text-xl leading-tight font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              {analysis.title}
            </h3>
            <div className="flex items-center justify-between">
              <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg
                  className="mr-2 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {analysis.createdAt
                  ? formatDate(analysis.createdAt)
                  : "Unknown date"}
              </p>

              {/* Completion Badge */}
              {analysis.uniqueWords > 0 && (
                <div className="flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  {completionPercentage}% Complete
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Word Statistics */}
          <LearningOverview statusCounts={analysis.wordsStat} />

          {/* Enhanced Summary Stats */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-600/50 dark:from-gray-700/50 dark:to-gray-800/50">
              <span className="mb-2 block text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Total Words
              </span>
              <span className="text-lg font-bold text-gray-800 dark:text-white">
                {analysis.totalWords?.toLocaleString?.() ?? "-"}
              </span>
            </div>
            <div className="rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-600/50 dark:from-gray-700/50 dark:to-gray-800/50">
              <span className="mb-2 block text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Unique Words
              </span>
              <span className="text-lg font-bold text-gray-800 dark:text-white">
                {analysis.uniqueWords?.toLocaleString?.() ?? "-"}
              </span>
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <svg
                  className="mr-1 h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Click to view details
              </span>
              <span className="flex items-center transition-colors duration-300 group-hover:text-blue-500">
                <span className="mr-1">View</span>
                <svg
                  className="h-3 w-3 transform transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

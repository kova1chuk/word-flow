import { useState } from "react";

import Link from "next/link";

import { useSelector } from "react-redux";

import { LearningOverview } from "@/components/LearningOverview";

import { selectUser } from "@/entities/user/model/selectors";

import { Analysis, analysesApi } from "../lib/analysesApi";

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
      await analysesApi.updateAnalysisStats(analysis.id, user.uid);
      onRefresh?.();
    } catch (error) {
      console.error("Error reloading stats:", error);
    } finally {
      setIsReloading(false);
    }
  };

  // Map wordStats to statusCounts for LearningOverview
  const getStatusCounts = () => {
    // First, try to use the new Supabase words_stat field
    if (analysis.words_stat) {
      const counts: { [key: number]: number } = {};
      // Convert string keys to numbers for consistency
      Object.entries(analysis.words_stat).forEach(([key, value]) => {
        counts[parseInt(key)] = value;
      });
      const total = Object.values(counts).reduce(
        (sum: number, count: number) => sum + (count || 0),
        0
      );
      return { counts, total };
    }

    // Fallback to legacy wordStats
    const wordStats =
      (analysis.summary as { wordStats?: { [key: number]: number } })
        ?.wordStats || analysis.wordStats;
    if (!wordStats) {
      return { counts: {}, total: 0 };
    }

    // Check if wordStats is in the new format (status counts)
    const hasStatusCounts =
      typeof wordStats === "object" &&
      wordStats !== null &&
      !("toLearn" in wordStats) &&
      !("toRepeat" in wordStats) &&
      !("learned" in wordStats);

    if (hasStatusCounts) {
      const counts = { ...wordStats } as { [key: number]: number };
      const total = Object.values(counts).reduce(
        (sum: number, count: number) => sum + (count || 0),
        0
      );
      return { counts, total };
    }

    // Fallback to the old mapping logic if it's in the old format
    const counts: { [key: number]: number } = {};
    for (let s = 1; s <= 7; s++) counts[s] = 0;

    // Distribute toLearn across statuses 1-3
    const toLearnPerStatus = Math.floor((wordStats.toLearn || 0) / 3);
    counts[1] = toLearnPerStatus;
    counts[2] = toLearnPerStatus;
    counts[3] = (wordStats.toLearn || 0) - toLearnPerStatus * 2;

    // Distribute toRepeat across statuses 4-5
    const toRepeatPerStatus = Math.floor((wordStats.toRepeat || 0) / 2);
    counts[4] = toRepeatPerStatus;
    counts[5] = (wordStats.toRepeat || 0) - toRepeatPerStatus;

    // Distribute learned across statuses 6-7
    const learnedPerStatus = Math.floor((wordStats.learned || 0) / 2);
    counts[6] = learnedPerStatus;
    counts[7] = (wordStats.learned || 0) - learnedPerStatus;

    const total =
      (wordStats.toLearn || 0) +
      (wordStats.toRepeat || 0) +
      (wordStats.learned || 0);
    return { counts, total };
  };

  const { counts: statusCounts, total: totalStatusWords } = getStatusCounts();

  // Calculate completeness from statusCounts using weighted average
  function calculateCompletenessFromCounts(counts: {
    [key: number]: number;
  }): number {
    const arr = Array.from({ length: 7 }, (_, i) => counts[i + 1] || 0);
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
    calculateCompletenessFromCounts(statusCounts)
  );

  return (
    <Link href={`/analyses/${analysis.id}`}>
      <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 h-full flex flex-col justify-between overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:scale-[1.02] transform">
        {/* Enhanced Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/60 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-purple-900/30 opacity-0 group-hover:opacity-100 transition-all duration-500" />

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-700">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        </div>

        {/* Enhanced Reload Button */}
        <button
          onClick={handleReload}
          disabled={isReloading}
          className="absolute top-4 right-4 z-20 p-3 rounded-xl bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-50 shadow-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 hover:shadow-xl hover:scale-110"
          title="Reload statistics"
        >
          <svg
            className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${
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
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 pr-16 leading-tight">
              {analysis.title}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-gray-400"
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
                  ? formatDate(analysis.createdAt.dateString)
                  : "Unknown date"}
              </p>

              {/* Completion Badge */}
              {totalStatusWords > 0 && (
                <div className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  {completionPercentage}% Complete
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Word Statistics */}
          <LearningOverview
            statusCounts={statusCounts}
            totalStatusWords={totalStatusWords}
          />

          {/* Enhanced Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50">
              <span className="text-gray-500 dark:text-gray-400 block mb-2 text-xs font-medium uppercase tracking-wide">
                Total Words
              </span>
              <span className="font-bold text-gray-800 dark:text-white text-lg">
                {analysis.summary?.totalWords?.toLocaleString?.() ?? "-"}
              </span>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50">
              <span className="text-gray-500 dark:text-gray-400 block mb-2 text-xs font-medium uppercase tracking-wide">
                Unique Words
              </span>
              <span className="font-bold text-gray-800 dark:text-white text-lg">
                {analysis.summary?.uniqueWords?.toLocaleString?.() ?? "-"}
              </span>
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
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
              <span className="flex items-center group-hover:text-blue-500 transition-colors duration-300">
                <span className="mr-1">View</span>
                <svg
                  className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-300"
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

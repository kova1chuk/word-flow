import Link from "next/link";

import PageLoader from "@/components/PageLoader";

import { useAnalyses } from "../lib/useAnalyses";

import { AnalysisCard } from "./AnalysisCard";
import { EmptyState } from "./EmptyState";
import { ErrorMessage } from "./ErrorMessage";

export const AnalysesPage: React.FC = () => {
  const { analyses, loading, error, refreshAnalyses } = useAnalyses();

  if (loading) {
    return <PageLoader text="Loading analyses..." />;
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header with Add Button */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Analyses
        </h1>
        <Link
          href="/reviews/create"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 hover:shadow-md"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Analysis
        </Link>
      </div>

      <ErrorMessage error={error} />

      {analyses.length === 0 && !loading ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {analyses.map((analysis) => (
            <AnalysisCard
              key={analysis.id}
              analysis={analysis}
              onRefresh={refreshAnalyses}
            />
          ))}
        </div>
      )}
    </div>
  );
};

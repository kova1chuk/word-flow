import { useAnalyses } from "../lib/useAnalyses";
import { AnalysisCard } from "./AnalysisCard";
import { EmptyState } from "./EmptyState";
import { ErrorMessage } from "./ErrorMessage";
import PageLoader from "@/components/PageLoader";

export const AnalysesPage: React.FC = () => {
  const { analyses, loading, error, refreshAnalyses } = useAnalyses();

  if (loading) {
    return <PageLoader text="Loading analyses..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Analyses
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Review your saved text and file analyses with word learning
                progress.
              </p>
            </div>

            {/* Page Refresh Button */}
            <button
              onClick={refreshAnalyses}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50"
              title="Refresh all analyses"
            >
              <svg
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
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
              Refresh
            </button>
          </div>

          {/* Stats Summary */}
          {/* Removed summary stats cards */}
        </div>

        <ErrorMessage error={error} />

        {analyses.length === 0 && !loading ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    </div>
  );
};

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
            <div></div>
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

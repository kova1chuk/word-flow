import { useAnalyses } from "../lib/useAnalyses";
import { AnalysisCard } from "./AnalysisCard";
import { EmptyState } from "./EmptyState";
import { ErrorMessage } from "./ErrorMessage";
import PageLoader from "@/components/PageLoader";

export const AnalysesPage: React.FC = () => {
  const { analyses, loading, error } = useAnalyses();

  if (loading) {
    return <PageLoader text="Loading analyses..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Analyses
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Review your saved text and file analyses.
          </p>
        </div>

        <ErrorMessage error={error} />

        {analyses.length === 0 && !loading ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {analyses.map((analysis) => (
              <AnalysisCard key={analysis.id} analysis={analysis} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

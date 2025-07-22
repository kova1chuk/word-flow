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
    <div className="max-w-7xl mx-auto">
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
  );
};

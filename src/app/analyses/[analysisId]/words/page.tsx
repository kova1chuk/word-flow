"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAnalysisWords } from "@/features/analysis-words";
import LoadingSpinner from "@/components/LoadingSpinner";
import { WordList } from "@/features/analysis-words/ui/WordList";
import { AnalysisWordsHeader } from "@/features/analysis-words/ui/AnalysisWordsHeader";

export default function AnalysisWordsPage() {
  const { user } = useAuth();
  const params = useParams();
  const analysisId = params.analysisId as string;

  const { words, analysis, loading, error, stats, refreshWords } =
    useAnalysisWords(analysisId);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please sign in to view words
          </h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error loading words
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshWords}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AnalysisWordsHeader
        analysis={analysis}
        stats={stats}
        onRefresh={refreshWords}
      />
      <div className="container mx-auto px-4 py-8">
        <WordList words={words} />
      </div>
    </div>
  );
}

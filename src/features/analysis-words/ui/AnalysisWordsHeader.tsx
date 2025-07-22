import React from "react";

import { supabase } from "@/lib/supabaseClient";

interface AnalysisWordsHeaderProps {
  analysis: {
    id: string;
    title: string;
    summary?: {
      wordStats?: Record<number, number>;
    };
  } | null;
}

export const AnalysisWordsHeader: React.FC<AnalysisWordsHeaderProps> = ({
  analysis,
}) => {
  if (!analysis) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalWords = analysis.summary?.wordStats
    ? Object.values(analysis.summary.wordStats).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {analysis.title} - Words
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {totalWords} total words in this analysis
        </p>

        {/* TODO: Add Supabase-based functionality here */}
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-400 text-sm">
            Note: This component needs Supabase implementation for full
            functionality.
          </p>
        </div>
      </div>
    </div>
  );
};

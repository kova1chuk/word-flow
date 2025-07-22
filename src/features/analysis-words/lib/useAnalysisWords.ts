import { useState, useEffect, useCallback } from "react";

import type { Analysis } from "@/entities/analysis/types";

export interface AnalysisWord {
  id: string;
  word: string;
  definition?: string;
  translation?: string;
  status: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  analysisId: string;
}

interface UseAnalysisWordsOptions {
  pageSize: number;
  statusFilter: (string | number)[] | "all";
  search: string;
}

export const useAnalysisWords = (
  analysisId: string,
  options: UseAnalysisWordsOptions,
) => {
  const [words, setWords] = useState<AnalysisWord[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWords = useCallback(async () => {
    if (!analysisId) return;

    setLoading(true);
    try {
      // TODO: Implement Supabase analysis words fetching
      console.log(
        "Fetching words for analysis:",
        analysisId,
        "with options:",
        options,
      );

      // Placeholder implementation
      setWords([]);
      const now = new Date();
      setAnalysis({
        id: analysisId,
        title: "Sample Analysis",
        userId: "placeholder-user-id",
        createdAt: {
          seconds: Math.floor(now.getTime() / 1000),
          nanoseconds: 0,
          dateString: now.toISOString(),
        },
        summary: {
          totalWords: 0,
          uniqueWords: 0,
          knownWords: 0,
          unknownWords: 0,
          wordStats: {},
        },
      });
    } catch (err) {
      console.error("Error fetching analysis words:", err);
      setError("Failed to load analysis words");
    } finally {
      setLoading(false);
    }
  }, [analysisId, options]);

  const refreshWords = useCallback(() => {
    fetchWords();
  }, [fetchWords]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  return {
    words,
    analysis,
    loading,
    error,
    refreshWords,
  };
};

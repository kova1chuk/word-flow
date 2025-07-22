import { useState, useEffect, useCallback } from "react";

import { useSelector } from "react-redux";

import { selectUser } from "@/entities/user/model/selectors";

import { supabase } from "@/lib/supabaseClient";

export interface AnalysisWord {
  id: string;
  word: string;
  status: number;
  isLearned: boolean;
  isInDictionary: boolean;
  usages: string[];
  definition?: string;
  translation?: string;
  createdAt: string | null;
}

export interface AnalysisStats {
  total: number;
  learned: number;
  notLearned: number;
}

export interface Analysis {
  id: string;
  title: string;
  createdAt: string;
  totalWords: number;
  uniqueWords: number;
  summary?: {
    wordStats?: Record<number, number>;
  };
}

export function useAnalysisWords(
  analysisId: string,
  options?: {
    pageSize?: number;
    statusFilter?: string | (string | number)[];
    search?: string;
  }
) {
  const user = useSelector(selectUser);
  const [words, setWords] = useState<AnalysisWord[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AnalysisStats>({
    total: 0,
    learned: 0,
    notLearned: 0,
  });

  const pageSize = options?.pageSize || 12;
  const statusFilter = options?.statusFilter ?? "all";
  const search = options?.search || "";

  const fetchWords = useCallback(async () => {
    if (!user || !analysisId) return;
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement Supabase analysis words fetching
      console.log("Would fetch analysis words:", {
        analysisId,
        pageSize,
        statusFilter,
        search,
      });

      // Placeholder: Set empty data for now
      setAnalysis({
        id: analysisId,
        title: "Analysis (Supabase implementation needed)",
        createdAt: new Date().toISOString(),
        totalWords: 0,
        uniqueWords: 0,
        summary: { wordStats: {} },
      });

      setWords([]);
      setStats({ total: 0, learned: 0, notLearned: 0 });
    } catch (err) {
      console.error("Error fetching analysis words:", err);
      setError(err instanceof Error ? err.message : "Failed to load words");
    } finally {
      setLoading(false);
    }
  }, [user, analysisId, pageSize, statusFilter, search]);

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
    stats,
    refreshWords,
  };
}

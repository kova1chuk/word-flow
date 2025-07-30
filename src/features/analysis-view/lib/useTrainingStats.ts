import { useState, useCallback } from "react";

// Types - keeping for future implementation
export interface TrainingStats {
  analysisId: string;
  totalWords: number;
  wordsPerStatus: { [key: number]: number };
}

export interface WordData {
  word: string;
  status: number;
  definition: string;
  translation?: string;
}

export const useTrainingStats = (analysisId: string) => {
  const [trainingStats, setTrainingStats] = useState<TrainingStats | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const fetchTrainingStats = useCallback(async () => {
    if (!analysisId) return;

    setLoading(true);
    try {
      // TODO: Implement Supabase training stats fetching
      console.log("Fetching training stats for analysis:", analysisId);

      // Placeholder data structure
      const mockStats: TrainingStats = {
        analysisId,
        totalWords: 0,
        wordsPerStatus: {},
      };

      setTrainingStats(mockStats);
    } catch (error) {
      console.error("Error fetching training stats:", error);
      setTrainingStats(null);
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  return {
    trainingStats,
    loading,
    fetchTrainingStats,
  };
};

import { useState, useEffect, useCallback } from "react";

import { useSelector } from "react-redux";

import { Analysis } from "@/entities/analysis/types";
import { selectUser } from "@/entities/user/model/selectors";

import { supabase } from "@/lib/supabaseClient";

interface TrainingStats {
  learned: number;
  notLearned: number;
  total: number;
}

interface WordData {
  id: string;
  word: string;
  status?: number;
  [key: string]: unknown;
}

export function useTrainingStats(
  analysisId: string,
  analysis: Analysis | null
) {
  const user = useSelector(selectUser);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainingStats, setTrainingStats] = useState<TrainingStats | null>(
    null
  );

  // Calculate stats from analysis.summary.wordStats
  const calculateStatsFromWordStats = useCallback(
    (wordStats: Record<number, number>) => {
      if (!wordStats) {
        return { learned: 0, notLearned: 0, total: 0 };
      }

      let learned = 0;
      let notLearned = 0;

      // Status 6-7 are considered learned
      for (let status = 6; status <= 7; status++) {
        learned += wordStats[status] || 0;
      }

      // Status 1-5 are considered not learned
      for (let status = 1; status <= 5; status++) {
        notLearned += wordStats[status] || 0;
      }

      const total = learned + notLearned;
      return { learned, notLearned, total };
    },
    []
  );

  // Update stats when analysis changes
  useEffect(() => {
    const stats = calculateStatsFromWordStats(
      analysis?.summary?.wordStats || {}
    );
    setTrainingStats(stats);
  }, [analysis, calculateStatsFromWordStats]);

  // Start training handler - TODO: Implement with Supabase
  const handleStartTraining = useCallback(async () => {
    if (!user || !analysisId) return;

    setTrainingLoading(true);
    try {
      // TODO: Implement Supabase version
      console.log("Would start training for analysis:", analysisId);

      // Placeholder: In Supabase version, this would:
      // 1. Call RPC to get words for training from analysis
      // 2. Save words to localStorage or Redux for training page
      // 3. Navigate to training page

      // For now, just log the action
      console.log("Training preparation would happen here");
    } catch (error) {
      console.error("Error preparing training:", error);
    } finally {
      setTrainingLoading(false);
    }
  }, [user, analysisId]);

  return {
    trainingLoading,
    trainingStats,
    handleStartTraining,
  };
}

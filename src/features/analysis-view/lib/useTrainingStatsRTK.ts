import { useState, useEffect, useCallback } from "react";

import { useSelector } from "react-redux";

import { selectUser } from "@/entities/user/model/selectors";

import { supabase } from "@/lib/supabaseClient";

interface TrainingStats {
  learned: number;
  notLearned: number;
  total: number;
}

// This hook is deprecated - use RTK slice instead
export function useTrainingStatsRTK(analysisId: string) {
  const user = useSelector(selectUser);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainingStats, setTrainingStats] = useState<TrainingStats | null>(
    null
  );

  const fetchTrainingStats = useCallback(async () => {
    if (!user || !analysisId) return;

    setTrainingLoading(true);
    try {
      // TODO: Implement Supabase training stats fetching
      console.log("Would fetch training stats:", {
        analysisId,
        userId: user.uid,
      });

      // Placeholder implementation
      setTrainingStats({ learned: 0, notLearned: 0, total: 0 });
    } catch (error) {
      console.error("Error fetching training stats:", error);
    } finally {
      setTrainingLoading(false);
    }
  }, [user, analysisId]);

  useEffect(() => {
    fetchTrainingStats();
  }, [fetchTrainingStats]);

  const handleStartTraining = useCallback(async () => {
    if (!user || !analysisId) return;

    console.log("Would start training for analysis:", analysisId);
    // TODO: Implement Supabase training start
  }, [user, analysisId]);

  return {
    trainingLoading,
    trainingStats,
    handleStartTraining,
  };
}

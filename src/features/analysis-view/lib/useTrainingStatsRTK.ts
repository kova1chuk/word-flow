import { useCallback } from "react";

export const useTrainingStatsRTK = (analysisId: string) => {
  const handleStartTraining = useCallback(
    (trainingType: string) => {
      // TODO: Implement Supabase training start functionality
      console.log(
        `Starting ${trainingType} training for analysis:`,
        analysisId,
      );
    },
    [analysisId],
  );

  return {
    handleStartTraining,
  };
};

import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/model/store";
import { useSelector } from "react-redux";
import { selectUser } from "@/entities/user/model/selectors";
import {
  fetchTrainingStats,
  clearTrainingStats,
} from "../model/trainingStatsSlice";
import {
  selectTrainingStats,
  selectTrainingStatsLoading,
  selectTrainingStatsError,
  selectHasTrainingData,
  selectTrainingProgress,
} from "../model/selectors";

export const useTrainingStatsRTK = (analysisId: string) => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);

  // Selectors
  const trainingStats = useAppSelector(selectTrainingStats);
  const trainingLoading = useAppSelector(selectTrainingStatsLoading);
  const trainingError = useAppSelector(selectTrainingStatsError);
  const hasTrainingData = useAppSelector(selectHasTrainingData);
  const trainingProgress = useAppSelector(selectTrainingProgress);

  // Actions
  const fetchStats = useCallback(() => {
    if (user && analysisId) {
      dispatch(fetchTrainingStats({ userId: user.uid, analysisId }));
    }
  }, [user, analysisId, dispatch]);

  const clearStats = useCallback(() => {
    dispatch(clearTrainingStats());
  }, [dispatch]);

  // Start training handler
  const handleStartTraining = useCallback(async () => {
    if (!hasTrainingData) return;

    // Save words to localStorage for the training page to pick up
    // Note: This would need to be updated to work with the new RTK state
    // For now, we'll need to fetch the words separately or modify the training page
    window.location.href = "/training?fromAnalysis=" + analysisId;
  }, [hasTrainingData, analysisId]);

  // Fetch stats on mount
  useEffect(() => {
    if (user && analysisId) {
      fetchStats();
    }
  }, [user, analysisId, fetchStats]);

  return {
    // State
    trainingLoading,
    trainingStats,
    trainingError,
    hasTrainingData,
    trainingProgress,

    // Actions
    fetchStats,
    clearStats,
    handleStartTraining,
  };
};

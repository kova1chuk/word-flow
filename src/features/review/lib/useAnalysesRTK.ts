import { useEffect, useCallback } from "react";

import { useSelector } from "react-redux";

import { selectUser } from "@/entities/user/model/selectors";

import { useAppDispatch, useAppSelector } from "@/shared/model/store";

import { fetchUserAnalyses, clearAnalyses } from "../model/analysesSlice";
import {
  selectAnalyses,
  selectAnalysesLoading,
  selectAnalysesError,
  selectAnalysesCount,
  selectLatestAnalysis,
} from "../model/selectors";

export const useAnalysesRTK = () => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);

  // Selectors
  const analyses = useAppSelector(selectAnalyses);
  const loading = useAppSelector(selectAnalysesLoading);
  const error = useAppSelector(selectAnalysesError);
  const count = useAppSelector(selectAnalysesCount);
  const latestAnalysis = useAppSelector(selectLatestAnalysis);

  // Actions
  const fetchAnalyses = useCallback(() => {
    if (user) {
      dispatch(fetchUserAnalyses(user.uid));
    }
  }, [user, dispatch]);

  const refreshAnalyses = useCallback(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const clearAnalysesData = useCallback(() => {
    dispatch(clearAnalyses());
  }, [dispatch]);

  // Load analyses when user changes
  useEffect(() => {
    if (user) {
      fetchAnalyses();
    } else {
      clearAnalysesData();
    }
  }, [user, fetchAnalyses, clearAnalysesData]);

  return {
    // State
    analyses,
    loading,
    error,
    count,
    latestAnalysis,

    // Actions
    fetchAnalyses,
    refreshAnalyses,
    clearAnalysesData,
  };
};

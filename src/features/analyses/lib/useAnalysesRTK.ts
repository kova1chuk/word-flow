import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { useAuth } from "@/lib/auth-context";
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
  const { user } = useAuth();

  // Selectors
  const analyses = useAppSelector(selectAnalyses);
  const loading = useAppSelector(selectAnalysesLoading);
  const error = useAppSelector(selectAnalysesError);
  const count = useAppSelector(selectAnalysesCount);
  const latestAnalysis = useAppSelector(selectLatestAnalysis);

  // Actions
  const fetchAnalyses = () => {
    if (user) {
      dispatch(fetchUserAnalyses(user.uid));
    }
  };

  const refreshAnalyses = () => {
    fetchAnalyses();
  };

  const clearAnalysesData = () => {
    dispatch(clearAnalyses());
  };

  // Load analyses when user changes
  useEffect(() => {
    if (user) {
      fetchAnalyses();
    } else {
      clearAnalysesData();
    }
  }, [user]);

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

import { useState, useEffect, useCallback } from "react";

import { useSelector } from "react-redux";

import { selectUser } from "@/entities/user/model/selectors";

import { fetchAnalysesSupabase, Analysis } from "./analysesApi";

export const useAnalyses = () => {
  const user = useSelector(selectUser);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalyses = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError("");
      const result = await fetchAnalysesSupabase(user.uid, 1, 50); // Fetch first 50 analyses
      console.log("result", result);
      setAnalyses(result.analyses);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      setError("Failed to load analyses");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshAnalyses = useCallback(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  // Load analyses when user changes
  useEffect(() => {
    if (user) {
      fetchAnalyses();
    } else {
      setAnalyses([]);
      setLoading(false);
    }
  }, [user, fetchAnalyses]);

  return {
    // State
    analyses,
    loading,
    error,

    // Actions
    refreshAnalyses,
  };
};

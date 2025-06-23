import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { analysesApi, Analysis } from "./analysesApi";

export const useAnalyses = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalyses = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError("");
      const analysesData = await analysesApi.fetchUserAnalyses(user.uid);
      setAnalyses(analysesData);
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

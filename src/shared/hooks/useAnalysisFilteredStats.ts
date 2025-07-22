import { useState, useEffect, useCallback } from "react";

import { useSelector } from "react-redux";

import { selectUser } from "@/entities/user/model/selectors";

import { supabase } from "@/lib/supabaseClient";

export function useAnalysisFilteredStats(analysisIds: string[]) {
  const user = useSelector(selectUser);
  const [stats, setStats] = useState<Record<number, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user?.uid || analysisIds.length === 0) {
      setStats(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc(
        "get_analysis_filtered_stats",
        {
          p_user_id: user.uid,
          p_analysis_ids: analysisIds,
        },
      );

      if (error) {
        throw error;
      }

      setStats(data?.wordStats || null);
    } catch (err) {
      console.error("Error fetching analysis filtered stats:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, analysisIds]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    filteredWordStats: stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

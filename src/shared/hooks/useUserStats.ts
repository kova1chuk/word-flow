import { useState, useEffect, useCallback } from "react";

import { useSelector } from "react-redux";

import { selectUser } from "@/entities/user/model/selectors";

import { supabase } from "@/lib/supabaseClient";

export function useUserStats() {
  const user = useSelector(selectUser);
  const [userStats, setUserStats] = useState<Record<number, number> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserStats = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc("get_user_stats", {
        p_user_id: user.uid,
      });

      if (error) {
        throw error;
      }

      setUserStats(data?.wordStats || null);
    } catch (err) {
      console.error("Error fetching user stats:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch user stats"
      );
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  return {
    userStats,
    loading,
    error,
    refetch: fetchUserStats,
  };
}

import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/entities/user/model/selectors";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export function useUserStats() {
  const user = useSelector(selectUser);
  const [wordStats, setWordStats] = useState<Record<number, number> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setWordStats(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const snap = await getDoc(doc(db, "userStats", user.uid));
      if (snap.exists()) {
        setWordStats(snap.data().wordStats || null);
      } else {
        setWordStats(null);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch userStats";
      setError(errorMessage);
      setWordStats(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refetch = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { wordStats, loading, error, refetch };
}

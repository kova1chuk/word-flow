import { useState, useEffect } from "react";

import { doc, getDoc } from "firebase/firestore";

import { useSelector } from "react-redux";

import { selectUser } from "@/entities/user/model/selectors";

import { db } from "@/lib/firebase";

export function useAnalysisFilteredStats(selectedAnalysisIds: string[]) {
  const user = useSelector(selectUser);
  const [filteredWordStats, setFilteredWordStats] = useState<Record<
    number,
    number
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setFilteredWordStats(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchFilteredStats = async () => {
      setLoading(true);
      setError(null);

      try {
        // Initialize stats object
        const stats: Record<number, number> = {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          6: 0,
          7: 0,
        };

        if (selectedAnalysisIds.length === 0) {
          // If no analyses selected, return empty stats
          setFilteredWordStats(stats);
          return;
        }

        // Fetch word stats from each selected analysis
        for (const analysisId of selectedAnalysisIds) {
          try {
            const analysisDoc = await getDoc(doc(db, "analyses", analysisId));

            if (analysisDoc.exists()) {
              const analysisData = analysisDoc.data();
              const wordStats =
                analysisData.summary?.wordStats || analysisData.wordStats;

              if (wordStats) {
                // Add stats from this analysis to the total
                Object.keys(wordStats).forEach((statusStr) => {
                  const status = parseInt(statusStr, 10);
                  if (status >= 1 && status <= 7) {
                    stats[status] =
                      (stats[status] || 0) + (wordStats[status] || 0);
                  }
                });
              }
            }
          } catch (err) {
            console.error(
              `Error fetching word stats for analysis ${analysisId}:`,
              err
            );
          }
        }

        setFilteredWordStats(stats);
      } catch (err) {
        console.error("Error fetching filtered word stats:", err);
        setError("Failed to fetch word stats for selected analyses");
        setFilteredWordStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredStats();
  }, [user, selectedAnalysisIds]);

  return { filteredWordStats, loading, error };
}

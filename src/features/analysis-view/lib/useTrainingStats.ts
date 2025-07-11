import { useState, useEffect, useCallback } from "react";

import { getDocs, collection, query, where } from "firebase/firestore";

import { useSelector } from "react-redux";

import { Analysis } from "@/entities/analysis/types";
import { selectUser } from "@/entities/user/model/selectors";

import { db } from "@/lib/firebase";

interface TrainingStats {
  learned: number;
  notLearned: number;
  total: number;
}

interface WordData {
  id: string;
  word: string;
  status?: number;
  [key: string]: unknown;
}

export function useTrainingStats(
  analysisId: string,
  analysis: Analysis | null
) {
  const user = useSelector(selectUser);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainingStats, setTrainingStats] = useState<TrainingStats | null>(
    null
  );

  // Calculate stats from analysis.summary.wordStats
  const calculateStatsFromWordStats = useCallback(
    (wordStats: Record<number, number>) => {
      if (!wordStats) {
        return { learned: 0, notLearned: 0, total: 0 };
      }

      let learned = 0;
      let notLearned = 0;

      // Status 6-7 are considered learned
      for (let status = 6; status <= 7; status++) {
        learned += wordStats[status] || 0;
      }

      // Status 1-5 are considered not learned
      for (let status = 1; status <= 5; status++) {
        notLearned += wordStats[status] || 0;
      }

      const total = learned + notLearned;
      return { learned, notLearned, total };
    },
    []
  );

  // Update stats when analysis changes
  useEffect(() => {
    const stats = calculateStatsFromWordStats(
      analysis?.summary?.wordStats || {}
    );
    setTrainingStats(stats);
  }, [analysis, calculateStatsFromWordStats]);

  // Start training handler
  const handleStartTraining = useCallback(async () => {
    if (!user || !analysisId) return;

    setTrainingLoading(true);
    try {
      // Fetch words from the analysis words subcollection for training
      const analysisWordsQuery = query(
        collection(db, "analyses", analysisId, "words")
      );
      const analysisWordsSnapshot = await getDocs(analysisWordsQuery);

      // Get all word IDs from the analysis
      const wordIds = analysisWordsSnapshot.docs.map(
        (doc) => doc.data().wordId
      );

      if (wordIds.length === 0) {
        setTrainingLoading(false);
        return;
      }

      // Fetch the actual word documents
      const words: WordData[] = [];

      // Process words in chunks to avoid query limits
      const chunkSize = 10;
      for (let i = 0; i < wordIds.length; i += chunkSize) {
        const chunk = wordIds.slice(i, i + chunkSize);
        const wordsQuery = query(
          collection(db, "words"),
          where("__name__", "in", chunk)
        );
        const wordsSnapshot = await getDocs(wordsQuery);

        wordsSnapshot.forEach((doc) => {
          words.push({ id: doc.id, ...doc.data() } as WordData);
        });
      }

      // Save words to localStorage for the training page to pick up
      localStorage.setItem("trainingWords", JSON.stringify(words));
      window.location.href = "/training?fromAnalysis=" + analysisId;
    } catch (error) {
      console.error("Error preparing training:", error);
    } finally {
      setTrainingLoading(false);
    }
  }, [user, analysisId]);

  return {
    trainingLoading,
    trainingStats,
    handleStartTraining,
  };
}

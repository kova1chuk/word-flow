import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface TrainingStats {
  learned: number;
  notLearned: number;
  total: number;
}

export const useTrainingStats = (analysisId: string) => {
  const { user } = useAuth();
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainingStats, setTrainingStats] = useState<TrainingStats | null>(
    null
  );

  // Fetch words for this analysis and compute stats
  const fetchWordsForAnalysis = useCallback(async () => {
    if (!user || !analysisId) return [];

    // Fetch words from the analysis words subcollection
    const analysisWordsQuery = query(
      collection(db, "analyses", analysisId, "words")
    );
    const analysisWordsSnapshot = await getDocs(analysisWordsQuery);

    // Get all word IDs from the analysis
    const wordIds = analysisWordsSnapshot.docs.map((doc) => doc.data().wordId);

    if (wordIds.length === 0) {
      setTrainingStats({ learned: 0, notLearned: 0, total: 0 });
      return [];
    }

    // Fetch the actual word documents
    const words: Record<string, unknown>[] = [];

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
        words.push(doc.data());
      });
    }

    // Compute stats
    let learned = 0;
    let notLearned = 0;
    for (const w of words) {
      if (w.status === "well_known") learned++;
      else notLearned++;
    }
    setTrainingStats({ learned, notLearned, total: words.length });
    return words;
  }, [user, analysisId]);

  // Start training handler
  const handleStartTraining = useCallback(async () => {
    setTrainingLoading(true);
    const words = await fetchWordsForAnalysis();
    // Save words to localStorage for the training page to pick up
    localStorage.setItem("trainingWords", JSON.stringify(words));
    setTrainingLoading(false);
    window.location.href = "/training?fromAnalysis=" + analysisId;
  }, [fetchWordsForAnalysis, analysisId]);

  // Fetch stats on mount
  useEffect(() => {
    fetchWordsForAnalysis();
  }, [fetchWordsForAnalysis]);

  return {
    trainingLoading,
    trainingStats,
    handleStartTraining,
  };
};

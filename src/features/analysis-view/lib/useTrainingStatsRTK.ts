import { useCallback } from "react";

import { getDocs, collection, query, where } from "firebase/firestore";

import { useSelector } from "react-redux";

import { setTrainingLoading } from "@/entities/analysis/model/analysisSlice";
import {
  selectTrainingStats,
  selectTrainingLoading,
} from "@/entities/analysis/model/selectors";
import { selectUser } from "@/entities/user/model/selectors";

import { useAppDispatch } from "@/shared/model/store";

import { db } from "@/lib/firebase";

export function useTrainingStatsRTK(analysisId: string) {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);
  const trainingStats = useSelector(selectTrainingStats);
  const trainingLoading = useSelector(selectTrainingLoading);

  // Start training handler
  const handleStartTraining = useCallback(async () => {
    if (!user || !analysisId) return;

    dispatch(setTrainingLoading(true));
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
        dispatch(setTrainingLoading(false));
        return;
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

      // Save words to localStorage for the training page to pick up
      localStorage.setItem("trainingWords", JSON.stringify(words));
      window.location.href = "/training?fromAnalysis=" + analysisId;
    } catch (error) {
      console.error("Error preparing training:", error);
    } finally {
      dispatch(setTrainingLoading(false));
    }
  }, [user, analysisId, dispatch]);

  return {
    trainingLoading,
    trainingStats,
    handleStartTraining,
  };
}

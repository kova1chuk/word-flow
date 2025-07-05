import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { useAuth } from "@/lib/auth-context";
import { fetchAnalysisWords } from "../model/analysisWordsSlice";
import {
  selectAnalysisWords,
  selectAnalysisWordsLoading,
  selectAnalysisWordsError,
  selectAnalysisWordsStats,
  selectLearnedWords,
  selectNotLearnedWords,
  selectWordsInDictionary,
} from "../model/selectors";

export const useAnalysisWordsRTK = (analysisId: string) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  // Selectors
  const words = useAppSelector(selectAnalysisWords);
  const loading = useAppSelector(selectAnalysisWordsLoading);
  const error = useAppSelector(selectAnalysisWordsError);
  const stats = useAppSelector(selectAnalysisWordsStats);
  const learnedWords = useAppSelector(selectLearnedWords);
  const notLearnedWords = useAppSelector(selectNotLearnedWords);
  const wordsInDictionary = useAppSelector(selectWordsInDictionary);

  // Actions
  const fetchWords = () => {
    if (user && analysisId) {
      dispatch(fetchAnalysisWords({ userId: user.uid, analysisId }));
    }
  };

  const refreshWords = () => {
    fetchWords();
  };

  // Load words when analysisId changes
  useEffect(() => {
    if (user && analysisId) {
      fetchWords();
    }
  }, [user, analysisId]);

  return {
    // State
    words,
    loading,
    error,
    stats,
    learnedWords,
    notLearnedWords,
    wordsInDictionary,

    // Actions
    fetchWords,
    refreshWords,
  };
};

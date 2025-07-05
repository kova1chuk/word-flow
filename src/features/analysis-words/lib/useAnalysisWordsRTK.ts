import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { useSelector } from "react-redux";
import { selectUser } from "@/entities/user/model/selectors";
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
  const user = useSelector(selectUser);

  // Selectors
  const words = useAppSelector(selectAnalysisWords);
  const loading = useAppSelector(selectAnalysisWordsLoading);
  const error = useAppSelector(selectAnalysisWordsError);
  const stats = useAppSelector(selectAnalysisWordsStats);
  const learnedWords = useAppSelector(selectLearnedWords);
  const notLearnedWords = useAppSelector(selectNotLearnedWords);
  const wordsInDictionary = useAppSelector(selectWordsInDictionary);

  // Actions
  const fetchWords = useCallback(() => {
    if (user && analysisId) {
      dispatch(fetchAnalysisWords({ userId: user.uid, analysisId }));
    }
  }, [user, analysisId, dispatch]);

  const refreshWords = useCallback(() => {
    fetchWords();
  }, [fetchWords]);

  // Load words when analysisId changes
  useEffect(() => {
    if (user && analysisId) {
      fetchWords();
    }
  }, [user, analysisId, fetchWords]);

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

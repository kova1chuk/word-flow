import { useEffect, useCallback } from "react";

import { useSelector } from "react-redux";

import {
  fetchAnalysis,
  fetchSentences,
  setViewMode,
  setIsFullScreen,
  setShowSettings,
  setSelectedWord,
  setCurrentPage,
  setSentencesPerPage,
  addTranslation,
  setTranslatingSentenceId,
  setTrainingStats,
  setTrainingLoading,
} from "@/entities/analysis/model/analysisSlice";
import {
  selectAnalysis,
  selectSentences,
  selectAnalysisLoading,
  selectAnalysisError,
  selectTranslatedSentences,
  selectTranslatingSentenceId,
  selectSelectedWord,
  selectWordInfoLoading,
  selectReloadingDefinition,
  selectReloadingTranslation,
  selectViewMode,
  selectIsFullScreen,
  selectCurrentPage,
  selectSentencesPerPage,
  selectShowSettings,
  selectTotalPages,
  selectCurrentSentences,
  selectStartIndex,
  selectSentencesLoading,
  selectHasMore,
  selectTrainingStats,
  selectTrainingLoading,
} from "@/entities/analysis/model/selectors";
import type { WordInfo } from "@/entities/analysis/types";
import { selectUser } from "@/entities/user/model/selectors";

import { useAppDispatch } from "@/shared/model/store";

export const useAnalysisViewRTK = (analysisId: string) => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);

  // Selectors
  const analysis = useSelector(selectAnalysis);
  const sentences = useSelector(selectSentences);
  const loading = useSelector(selectAnalysisLoading);
  const error = useSelector(selectAnalysisError);
  const translatedSentences = useSelector(selectTranslatedSentences);
  const translatingSentenceId = useSelector(selectTranslatingSentenceId);
  const selectedWord = useSelector(selectSelectedWord);
  const wordInfoLoading = useSelector(selectWordInfoLoading);
  const reloadingDefinition = useSelector(selectReloadingDefinition);
  const reloadingTranslation = useSelector(selectReloadingTranslation);
  const viewMode = useSelector(selectViewMode);
  const isFullScreen = useSelector(selectIsFullScreen);
  const currentPage = useSelector(selectCurrentPage);
  const sentencesPerPage = useSelector(selectSentencesPerPage);
  const showSettings = useSelector(selectShowSettings);
  const totalPages = useSelector(selectTotalPages);
  const currentSentences = useSelector(selectCurrentSentences);
  const startIndex = useSelector(selectStartIndex);
  const sentencesLoading = useSelector(selectSentencesLoading);
  const hasMore = useSelector(selectHasMore);
  const trainingStats = useSelector(selectTrainingStats);
  const trainingLoading = useSelector(selectTrainingLoading);

  // Load analysis data
  const loadAnalysis = useCallback(async () => {
    if (!user || !analysisId) return;
    await dispatch(fetchAnalysis({ analysisId, userId: user.uid }));
  }, [user, analysisId, dispatch]);

  // Load sentences for a specific page
  const loadSentencesPage = useCallback(
    async (page: number) => {
      if (!user || !analysisId) return;
      await dispatch(
        fetchSentences({
          analysisId,
          page,
          pageSize: sentencesPerPage,
          userId: user.uid,
        })
      );
    },
    [user, analysisId, sentencesPerPage, dispatch]
  );

  // Calculate training stats from analysis
  const calculateTrainingStats = useCallback(() => {
    if (!analysis?.summary?.wordStats) {
      return { learned: 0, notLearned: 0, total: 0 };
    }

    const wordStats = analysis.summary.wordStats;
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
  }, [analysis]);

  // Update training stats when analysis changes
  useEffect(() => {
    const stats = calculateTrainingStats();
    dispatch(setTrainingStats(stats));
  }, [analysis, calculateTrainingStats, dispatch]);

  // Initialize data
  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  // Load initial sentences
  useEffect(() => {
    if (analysis && sentences.length === 0) {
      loadSentencesPage(1);
    }
  }, [analysis, sentences.length, loadSentencesPage]);

  return {
    // State
    analysis,
    sentences,
    loading,
    sentencesLoading,
    error,
    translatedSentences,
    translatingSentenceId,
    selectedWord,
    wordInfoLoading,
    reloadingDefinition,
    reloadingTranslation,
    viewMode,
    isFullScreen,
    currentPage,
    sentencesPerPage,
    showSettings,
    totalPages,
    currentSentences,
    startIndex,
    hasMore,
    trainingStats,
    trainingLoading,

    // Actions
    setViewMode: (mode: "list" | "columns") => dispatch(setViewMode(mode)),
    setIsFullScreen: (fullScreen: boolean) =>
      dispatch(setIsFullScreen(fullScreen)),
    setShowSettings: (show: boolean) => dispatch(setShowSettings(show)),
    setSelectedWord: (word: WordInfo | null) => dispatch(setSelectedWord(word)),
    setCurrentPage: (page: number) => dispatch(setCurrentPage(page)),
    setSentencesPerPage: (perPage: number) =>
      dispatch(setSentencesPerPage(perPage)),
    addTranslation: (sentenceId: string, translation: string) =>
      dispatch(addTranslation({ sentenceId, translation })),
    setTranslatingSentenceId: (sentenceId: string | null) =>
      dispatch(setTranslatingSentenceId(sentenceId)),
    setTrainingLoading: (loading: boolean) =>
      dispatch(setTrainingLoading(loading)),
    loadSentencesPage,
  };
};

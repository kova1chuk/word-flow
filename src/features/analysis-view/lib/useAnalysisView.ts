import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
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
} from "@/entities/analysis";
import {
  setAnalysis,
  setSentences,
  setLoading,
  setError,
  setViewMode,
  setIsFullScreen,
  setShowSettings,
  setSelectedWord,
} from "@/entities/analysis";
import { fetchAnalysisDetails } from "./analysisApi";
import { WordInfo } from "@/entities/analysis";
import { useSelector } from "react-redux";
import { selectUser } from "@/entities/user/model/selectors";

export const useAnalysisView = (analysisId: string) => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);

  // Selectors
  const analysis = useAppSelector(selectAnalysis);
  const sentences = useAppSelector(selectSentences);
  const loading = useAppSelector(selectAnalysisLoading);
  const error = useAppSelector(selectAnalysisError);
  const translatedSentences = useAppSelector(selectTranslatedSentences);
  const translatingSentenceId = useAppSelector(selectTranslatingSentenceId);
  const selectedWord = useAppSelector(selectSelectedWord);
  const wordInfoLoading = useAppSelector(selectWordInfoLoading);
  const reloadingDefinition = useAppSelector(selectReloadingDefinition);
  const reloadingTranslation = useAppSelector(selectReloadingTranslation);
  const viewMode = useAppSelector(selectViewMode);
  const isFullScreen = useAppSelector(selectIsFullScreen);
  const currentPage = useAppSelector(selectCurrentPage);
  const sentencesPerPage = useAppSelector(selectSentencesPerPage);
  const showSettings = useAppSelector(selectShowSettings);
  const totalPages = useAppSelector(selectTotalPages);
  const currentSentences = useAppSelector(selectCurrentSentences);
  const startIndex = useAppSelector(selectStartIndex);

  // Load analysis data
  const loadAnalysis = useCallback(async () => {
    if (!user || !analysisId) return;

    try {
      dispatch(setLoading(true));
      const { analysis: analysisData, sentences: sentencesData } =
        await fetchAnalysisDetails(analysisId, user.uid);
      dispatch(setAnalysis(analysisData));
      dispatch(setSentences(sentencesData));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load analysis details.";
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, analysisId, dispatch]);

  // Initialize data
  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  return {
    // State
    analysis,
    sentences,
    loading,
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

    // Actions
    setViewMode: (mode: "list" | "columns") => dispatch(setViewMode(mode)),
    setIsFullScreen: (fullScreen: boolean) =>
      dispatch(setIsFullScreen(fullScreen)),
    setShowSettings: (show: boolean) => dispatch(setShowSettings(show)),
    setSelectedWord: (word: WordInfo | null) => dispatch(setSelectedWord(word)),
  };
};

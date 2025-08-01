import { useEffect, useCallback, useState } from "react";

import { useSelector } from "react-redux";

import {
  setAnalysis,
  setSentences,
  setLoading,
  setError,
  setViewMode,
  setIsFullScreen,
  setShowSettings,
  setSelectedWord,
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
} from "@/entities/analysis/model/selectors";
import type { WordInfo } from "@/entities/analysis/types";
import { FirestoreDocSnapshot } from "@/entities/analysis/types";
import { selectUser } from "@/entities/user/model/selectors";

import { useAppDispatch, useAppSelector } from "@/shared/model/store";

import { fetchAnalysisDetails, fetchSentencesPage } from "./analysisApi";

export const useAnalysisView = (analysisId: string) => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);
  const [sentencesLoading, setSentencesLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState<FirestoreDocSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

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
      const { analysis: analysisData } = await fetchAnalysisDetails(
        analysisId,
        user.uid,
      );
      dispatch(setAnalysis(analysisData));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load analysis details.";
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, analysisId, dispatch]);

  // Load sentences for a specific page
  const loadSentencesPage = useCallback(
    async (page: number) => {
      if (!user || !analysisId) return;

      try {
        setSentencesLoading(true);
        const { sentences: sentencesData, hasMore: more } =
          await fetchSentencesPage(
            analysisId,
            page,
            sentencesPerPage,
            user.uid,
          );

        setLastDoc(null); // TODO: Implement lastDoc when pagination with Firestore is implemented
        setHasMore(more);

        // Update sentences in store
        if (page === 1) {
          dispatch(setSentences(sentencesData));
        } else {
          // Append to existing sentences for pagination
          dispatch(setSentences([...sentences, ...sentencesData]));
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load sentences.";
        dispatch(setError(errorMessage));
      } finally {
        setSentencesLoading(false);
      }
    },
    [user, analysisId, sentencesPerPage, lastDoc, sentences, dispatch],
  );

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

    // Actions
    setViewMode: (mode: "list" | "columns") => dispatch(setViewMode(mode)),
    setIsFullScreen: (fullScreen: boolean) =>
      dispatch(setIsFullScreen(fullScreen)),
    setShowSettings: (show: boolean) => dispatch(setShowSettings(show)),
    setSelectedWord: (word: WordInfo | null) => dispatch(setSelectedWord(word)),
    loadSentencesPage,
  };
};

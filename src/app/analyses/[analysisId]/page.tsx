"use client";

import { useParams } from "next/navigation";
import { useAppDispatch } from "@/app/store";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useCallback } from "react";
import PageLoader from "@/components/PageLoader";
import Link from "next/link";

// Import analysis view components
import {
  useAnalysisView,
  AnalysisHeader,
  AnalysisControls,
  SentenceList,
  Pagination,
  WordInfoModal,
  SettingsModal,
} from "@/features/analysis-view";

// Import analysis actions
import {
  setCurrentPage,
  setSentencesPerPage,
  addTranslation,
  setTranslatingSentenceId,
  setWordInfoLoading,
  setReloadingDefinition,
  setReloadingTranslation,
} from "@/entities/analysis";

// Import API functions
import {
  saveReadingProgress,
  loadReadingProgress,
  saveUserSettings,
  loadUserSettings,
  translateSentence,
  fetchWordInfo,
} from "@/features/analysis-view/lib/analysisApi";

export default function SingleAnalysisPage() {
  const { user } = useAuth();
  const params = useParams();
  const analysisId = params.analysisId as string;
  const dispatch = useAppDispatch();

  const {
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
    setViewMode,
    setIsFullScreen,
    setShowSettings,
    setSelectedWord,
  } = useAnalysisView(analysisId);

  // Load reading progress
  useEffect(() => {
    if (user && analysisId) {
      const loadProgress = async () => {
        try {
          const progress = await loadReadingProgress(user.uid, analysisId);
          if (progress) {
            dispatch(setCurrentPage(progress.currentPage));
          }
        } catch (error) {
          console.error("Error loading reading progress:", error);
        }
      };
      loadProgress();
    }
  }, [user, analysisId, dispatch]);

  // Load user settings
  useEffect(() => {
    if (user) {
      const loadSettings = async () => {
        try {
          const settings = await loadUserSettings(user.uid);
          if (settings) {
            dispatch(setSentencesPerPage(settings.sentencesPerPage));
          }
        } catch (error) {
          console.error("Error loading user settings:", error);
        }
      };
      loadSettings();
    }
  }, [user, dispatch]);

  // Save reading progress
  const saveProgress = useCallback(
    async (page: number, sentenceIndex: number = 0) => {
      if (!user || !analysisId) return;

      try {
        await saveReadingProgress(user.uid, analysisId, page, sentenceIndex);
      } catch (error) {
        console.error("Error saving reading progress:", error);
      }
    },
    [user, analysisId]
  );

  // Save user settings
  const saveSettings = useCallback(
    async (newSentencesPerPage: number) => {
      if (!user) return;

      try {
        await saveUserSettings(user.uid, newSentencesPerPage);
        dispatch(setSentencesPerPage(newSentencesPerPage));

        // Recalculate current page to maintain position
        const newTotalPages = Math.ceil(sentences.length / newSentencesPerPage);
        const newCurrentPage = Math.min(currentPage, newTotalPages);
        dispatch(setCurrentPage(newCurrentPage));
        saveProgress(newCurrentPage);
      } catch (error) {
        console.error("Error saving user settings:", error);
      }
    },
    [user, sentences.length, currentPage, dispatch, saveProgress]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      dispatch(setCurrentPage(newPage));
      saveProgress(newPage);
    },
    [dispatch, saveProgress]
  );

  // Handle word click
  const handleWordClick = useCallback(
    async (word: string) => {
      setSelectedWord({ word });
      dispatch(setWordInfoLoading(true));

      try {
        const { definition, translation, details } = await fetchWordInfo(word);
        setSelectedWord({
          word,
          definition,
          translation,
          details,
        });
      } catch (error) {
        console.error("Error fetching word info:", error);
        setSelectedWord({
          word,
          definition: "Failed to load definition",
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      } finally {
        dispatch(setWordInfoLoading(false));
      }
    },
    [setSelectedWord, dispatch]
  );

  // Reload definition
  const reloadDefinition = useCallback(async () => {
    if (!selectedWord) return;
    dispatch(setReloadingDefinition(true));

    try {
      const { definition, details } = await fetchWordInfo(selectedWord.word);
      setSelectedWord({
        ...selectedWord,
        definition,
        details,
      });
    } catch (error) {
      console.error("Error reloading definition:", error);
      setSelectedWord({
        ...selectedWord,
        definition: "Failed to reload definition",
        details: {
          ...selectedWord.details,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    } finally {
      dispatch(setReloadingDefinition(false));
    }
  }, [selectedWord, setSelectedWord, dispatch]);

  // Reload translation
  const reloadTranslation = useCallback(async () => {
    if (!selectedWord) return;
    dispatch(setReloadingTranslation(true));

    try {
      const translation = await translateSentence(selectedWord.word);
      setSelectedWord({
        ...selectedWord,
        translation,
      });
    } catch (error) {
      console.error("Error reloading translation:", error);
      setSelectedWord({
        ...selectedWord,
        translation: "Failed to reload translation",
      });
    } finally {
      dispatch(setReloadingTranslation(false));
    }
  }, [selectedWord, setSelectedWord, dispatch]);

  // Handle translate sentence
  const handleTranslate = useCallback(
    async (sentenceId: string, text: string) => {
      if (translatedSentences[sentenceId]) return;
      dispatch(setTranslatingSentenceId(sentenceId));

      try {
        const translation = await translateSentence(text);
        dispatch(addTranslation({ sentenceId, translation }));
      } catch (error) {
        console.error("Translation error:", error);
        dispatch(
          addTranslation({ sentenceId, translation: "Translation failed." })
        );
      } finally {
        dispatch(setTranslatingSentenceId(null));
      }
    },
    [translatedSentences, dispatch]
  );

  if (loading) {
    return <PageLoader text="Loading analysis..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-red-600 text-lg">{error}</p>
          <Link href="/analyses">
            <span className="text-blue-600 hover:underline mt-4 inline-block">
              Back to My Analyses
            </span>
          </Link>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div
      className={`${
        isFullScreen
          ? "fixed inset-0 z-50 bg-white dark:bg-gray-900"
          : "min-h-screen bg-gray-50 dark:bg-gray-900"
      }`}
    >
      <div
        className={`${
          isFullScreen
            ? "h-full flex flex-col"
            : "max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
        }`}
      >
        {!isFullScreen && <AnalysisHeader analysis={analysis} />}

        {/* Sentences List */}
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${
            isFullScreen ? "flex-1 flex flex-col" : ""
          }`}
        >
          <AnalysisControls
            sentencesLength={sentences.length}
            currentPage={currentPage}
            totalPages={totalPages}
            viewMode={viewMode}
            isFullScreen={isFullScreen}
            onViewModeChange={setViewMode}
            onFullScreenToggle={() => setIsFullScreen(!isFullScreen)}
            onSettingsToggle={() => setShowSettings(true)}
          />

          <SentenceList
            sentences={currentSentences}
            viewMode={viewMode}
            isFullScreen={isFullScreen}
            translatedSentences={translatedSentences}
            translatingSentenceId={translatingSentenceId}
            onWordClick={handleWordClick}
            onTranslate={handleTranslate}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <WordInfoModal
        selectedWord={selectedWord}
        wordInfoLoading={wordInfoLoading}
        reloadingDefinition={reloadingDefinition}
        reloadingTranslation={reloadingTranslation}
        onClose={() => setSelectedWord(null)}
        onReloadDefinition={reloadDefinition}
        onReloadTranslation={reloadTranslation}
      />

      <SettingsModal
        showSettings={showSettings}
        sentencesPerPage={sentencesPerPage}
        onClose={() => setShowSettings(false)}
        onSentencesPerPageChange={(value) =>
          dispatch(setSentencesPerPage(value))
        }
        onSave={() => {
          saveSettings(sentencesPerPage);
          setShowSettings(false);
        }}
      />
    </div>
  );
}

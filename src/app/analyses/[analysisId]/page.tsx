"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/shared/model/store";
import { useCallback } from "react";
import PageLoader from "@/components/PageLoader";
import Link from "next/link";

// Import analysis view components and hooks
import {
  useAnalysisView,
  useTrainingStats,
  useWordManagement,
  useUserSettings,
  AnalysisHeader,
  AnalysisContent,
  TrainingStatsSection,
  WordInfoModal,
  SettingsModal,
} from "@/features/analysis-view";

// Import analysis actions
import {
  setCurrentPage,
  setSentencesPerPage,
  addTranslation,
  setTranslatingSentenceId,
} from "@/entities/analysis";

// Import API functions
import { translateSentence } from "@/features/analysis-view/lib/analysisApi";

export default function SingleAnalysisPage() {
  const params = useParams();
  const analysisId = params.analysisId as string;
  const dispatch = useAppDispatch();
  const router = useRouter();

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

  // Custom hooks
  const { trainingLoading, trainingStats, handleStartTraining } =
    useTrainingStats(analysisId);
  const { reloadDefinition, reloadTranslation } = useWordManagement(
    selectedWord,
    setSelectedWord
  );
  const { saveProgress, saveSettings } = useUserSettings(
    analysisId,
    sentences,
    currentPage
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
  const handleWordClick = useCallback(async () => {
    // Navigate to the words list page for this analysis
    router.push(`/analyses/${analysisId}/words`);
  }, [router, analysisId]);

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
          : "bg-gray-50 dark:bg-gray-900"
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

        {/* Training stats and button */}
        {!isFullScreen && (
          <TrainingStatsSection
            analysisId={analysisId}
            trainingStats={trainingStats}
            trainingLoading={trainingLoading}
            onStartTraining={handleStartTraining}
          />
        )}

        {/* Analysis Content */}
        <AnalysisContent
          sentences={sentences}
          currentSentences={currentSentences}
          currentPage={currentPage}
          totalPages={totalPages}
          viewMode={viewMode}
          isFullScreen={isFullScreen}
          translatedSentences={translatedSentences}
          translatingSentenceId={translatingSentenceId}
          onViewModeChange={setViewMode}
          onFullScreenToggle={() => setIsFullScreen(!isFullScreen)}
          onSettingsToggle={() => setShowSettings(true)}
          onWordClick={handleWordClick}
          onTranslate={handleTranslate}
          onPageChange={handlePageChange}
        />
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

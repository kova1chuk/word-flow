"use client";

import { useCallback, Suspense } from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import PageLoader from "@/components/PageLoader";

import {
  AnalysisHeader,
  AnalysisContent,
  TrainingStatsSection,
  WordInfoModal,
  SettingsModal,
} from "@/features/analysis-view";
import { translateSentence } from "@/features/analysis-view/lib/analysisApi";
import { useAnalysisViewRTK } from "@/features/analysis-view/lib/useAnalysisViewRTK";
import { useTrainingStatsRTK } from "@/features/analysis-view/lib/useTrainingStatsRTK";

// Skeleton Components
const AnalysisHeaderSkeleton = () => (
  <div className="mb-8">
    <div className="mb-6">
      <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="space-y-4">
            <div className="w-3/4 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TrainingStatsSectionSkeleton = () => (
  <div className="mb-8">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" />
              <div className="ml-3 flex-1">
                <div className="w-20 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2" />
                <div className="w-12 h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AnalysisContentSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
    <div className="space-y-4 p-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-4 p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
        >
          <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Main Analysis Component
function AnalysisPageContent() {
  const params = useParams();
  const analysisId = params.analysisId as string;
  const router = useRouter();

  const {
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
    trainingStats,
    trainingLoading,
    setViewMode,
    setIsFullScreen,
    setShowSettings,
    setSelectedWord,
    setCurrentPage,
    setSentencesPerPage,
    addTranslation,
    setTranslatingSentenceId,
    loadSentencesPage,
  } = useAnalysisViewRTK(analysisId);

  // Custom hooks
  const { handleStartTraining } = useTrainingStatsRTK(analysisId);

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);

      // Load sentences for the new page if needed
      if (newPage > 1 && sentences.length < newPage * sentencesPerPage) {
        loadSentencesPage(newPage);
      }
    },
    [setCurrentPage, sentences.length, sentencesPerPage, loadSentencesPage]
  );

  // Handle word click
  const handleWordClick = useCallback(async () => {
    // Navigate to the words list page for this analysis
    router.push(`/analyses/${analysisId}/words`);
  }, [router, analysisId]);

  // Handle translate sentence
  const handleTranslate = useCallback(
    async (sentenceId: string, text: string) => {
      console.log("🔍 Translation requested:", {
        sentenceId,
        text: text.substring(0, 100) + "...",
      });
      console.log("🔍 Current translated sentences:", translatedSentences);

      if (translatedSentences[sentenceId]) return;
      setTranslatingSentenceId(sentenceId);

      try {
        const translation = await translateSentence(text);
        console.log("✅ Translation received:", { sentenceId, translation });
        addTranslation(sentenceId, translation);
      } catch (error) {
        console.error("Translation error:", error);
        addTranslation(sentenceId, "Translation failed.");
      } finally {
        setTranslatingSentenceId(null);
      }
    },
    [translatedSentences, setTranslatingSentenceId, addTranslation]
  );

  if (loading) {
    return <PageLoader text="Loading analysis..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading Analysis
            </h2>
            <p className="text-red-600 dark:text-red-400 text-sm mb-6">
              {error}
            </p>
            <Link
              href="/analyses"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to My Analyses
            </Link>
          </div>
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
            : "max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
        }`}
      >
        {/* Header Section */}
        {!isFullScreen && (
          <Suspense fallback={<AnalysisHeaderSkeleton />}>
            <AnalysisHeader analysis={analysis} />
          </Suspense>
        )}

        {/* Training Stats Section */}
        {!isFullScreen && (
          <Suspense fallback={<TrainingStatsSectionSkeleton />}>
            <TrainingStatsSection
              analysisId={analysisId}
              trainingStats={trainingStats}
              trainingLoading={trainingLoading}
              onStartTraining={handleStartTraining}
            />
          </Suspense>
        )}

        {/* Main Content */}
        <div className={`${isFullScreen ? "flex-1" : ""}`}>
          <Suspense fallback={<AnalysisContentSkeleton />}>
            <AnalysisContent
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
              sentencesLoading={sentencesLoading}
            />
          </Suspense>
        </div>
      </div>

      {/* Modals */}
      <WordInfoModal
        selectedWord={selectedWord}
        wordInfoLoading={wordInfoLoading}
        reloadingDefinition={reloadingDefinition}
        reloadingTranslation={reloadingTranslation}
        onClose={() => setSelectedWord(null)}
        onReloadDefinition={() => {}} // TODO: Implement reload definition
        onReloadTranslation={() => {}} // TODO: Implement reload translation
      />

      <SettingsModal
        showSettings={showSettings}
        sentencesPerPage={sentencesPerPage}
        onClose={() => setShowSettings(false)}
        onSentencesPerPageChange={setSentencesPerPage}
        onSave={() => {
          setShowSettings(false);
        }}
      />
    </div>
  );
}

// Main Page Component with Suspense
export default function SingleAnalysisPage() {
  return (
    <Suspense fallback={<PageLoader text="Loading analysis..." />}>
      <AnalysisPageContent />
    </Suspense>
  );
}

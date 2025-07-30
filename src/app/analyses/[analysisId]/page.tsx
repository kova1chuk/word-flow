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
      <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    </div>
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TrainingStatsSectionSkeleton = () => (
  <div className="mb-8">
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-3 w-full animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50"
          >
            <div className="flex items-center">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600" />
              <div className="ml-3 flex-1">
                <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
                <div className="h-6 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AnalysisContentSkeleton = () => (
  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="border-b border-gray-200 dark:border-gray-700">
      <div className="mb-6 flex flex-col gap-4 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:bg-gray-800/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
    <div className="space-y-4 p-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-4 border-b border-gray-100 p-4 last:border-b-0 dark:border-gray-700"
        >
          <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
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

  // Handle start training without parameters
  const handleStartTrainingWrapper = useCallback(() => {
    handleStartTraining("general"); // Default training type
  }, [handleStartTraining]);

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);

      // Load sentences for the new page if needed
      if (newPage > 1 && sentences.length < newPage * sentencesPerPage) {
        loadSentencesPage(newPage);
      }
    },
    [setCurrentPage, sentences.length, sentencesPerPage, loadSentencesPage],
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
    [translatedSentences, setTranslatingSentenceId, addTranslation],
  );

  if (loading) {
    return <PageLoader text="Loading analysis..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-md p-8 text-center">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                className="h-8 w-8 text-red-600 dark:text-red-400"
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
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Error Loading Analysis
            </h2>
            <p className="mb-6 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
            <Link
              href="/analyses"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-700"
            >
              <svg
                className="mr-2 h-4 w-4"
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
            ? "flex h-full flex-col"
            : "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
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
              onStartTraining={handleStartTrainingWrapper}
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

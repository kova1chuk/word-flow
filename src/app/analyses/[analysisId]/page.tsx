"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/app/store";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useCallback, useState } from "react";
import PageLoader from "@/components/PageLoader";
import Link from "next/link";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainingStats, setTrainingStats] = useState<{
    learned: number;
    notLearned: number;
    total: number;
  } | null>(null);

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
  const handleWordClick = useCallback(async () => {
    // Navigate to the words list page for this analysis
    router.push(`/analyses/${analysisId}/words`);
  }, [router, analysisId]);

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

  // Fetch words for this analysis and compute stats
  const fetchWordsForAnalysis = useCallback(async () => {
    if (!user || !analysisId) return [];

    // Fetch words from the analysis words subcollection
    const analysisWordsQuery = query(
      collection(db, "analyses", analysisId, "words")
    );
    const analysisWordsSnapshot = await getDocs(analysisWordsQuery);

    // Get all word IDs from the analysis
    const wordIds = analysisWordsSnapshot.docs.map((doc) => doc.data().wordId);

    if (wordIds.length === 0) {
      setTrainingStats({ learned: 0, notLearned: 0, total: 0 });
      return [];
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

    // Compute stats
    let learned = 0;
    let notLearned = 0;
    for (const w of words) {
      if (w.status === "well_known") learned++;
      else notLearned++;
    }
    setTrainingStats({ learned, notLearned, total: words.length });
    return words;
  }, [user, analysisId]);

  // Start training handler
  const handleStartTraining = useCallback(async () => {
    setTrainingLoading(true);
    const words = await fetchWordsForAnalysis();
    // Save words to localStorage for the training page to pick up
    localStorage.setItem("trainingWords", JSON.stringify(words));
    setTrainingLoading(false);
    window.location.href = "/training?fromAnalysis=" + analysisId;
  }, [fetchWordsForAnalysis, analysisId]);

  // Fetch stats on mount
  useEffect(() => {
    fetchWordsForAnalysis();
  }, [fetchWordsForAnalysis]);

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

        {/* Training stats and button */}
        {!isFullScreen && trainingStats && (
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-6">
              <div className="text-green-600 font-semibold">
                Learned: {trainingStats.learned}
              </div>
              <div className="text-red-600 font-semibold">
                Not learned: {trainingStats.notLearned}
              </div>
              <div className="text-gray-600 font-semibold">
                Total: {trainingStats.total}
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <button
                onClick={handleStartTraining}
                disabled={trainingLoading || trainingStats.total === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50"
              >
                {trainingLoading ? "Preparing..." : "Start Training"}
              </button>
              <button
                onClick={() => router.push(`/analyses/${analysisId}/words`)}
                className="mt-2 bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-bold"
              >
                Words Statistic
              </button>
            </div>
          </div>
        )}

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

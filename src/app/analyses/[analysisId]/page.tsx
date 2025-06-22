"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AutoSizer,
  List,
  CellMeasurer,
  CellMeasurerCache,
} from "react-virtualized";
import "react-virtualized/styles.css"; // Import default styles
import { config } from "@/lib/config";
import PageLoader from "@/components/PageLoader";

interface Analysis {
  id: string;
  title: string;
  createdAt: Timestamp;
  summary: {
    totalWords: number;
    uniqueWords: number;
    knownWords: number;
    unknownWords: number;
  };
}

interface Sentence {
  id: string;
  text: string;
  index: number;
}

interface WordInfo {
  word: string;
  definition?: string;
  translation?: string;
  details?: Record<string, unknown>;
}

interface ReadingProgress {
  currentPage: number;
  currentSentenceIndex: number;
  lastReadAt: Timestamp;
}

interface UserSettings {
  sentencesPerPage: number;
}

export default function SingleAnalysisPage() {
  const { user } = useAuth();
  const params = useParams();
  const analysisId = params.analysisId as string;

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [translatedSentences, setTranslatedSentences] = useState<
    Record<string, string>
  >({});
  const [translatingSentenceId, setTranslatingSentenceId] = useState<
    string | null
  >(null);
  const [viewMode, setViewMode] = useState<"list" | "columns">("list");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sentencesPerPage, setSentencesPerPage] = useState(20);
  const [selectedWord, setSelectedWord] = useState<WordInfo | null>(null);
  const [wordInfoLoading, setWordInfoLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [reloadingDefinition, setReloadingDefinition] = useState(false);
  const [reloadingTranslation, setReloadingTranslation] = useState(false);

  const listRef = useRef<List | null>(null);

  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 50,
    })
  );

  // Calculate pagination
  const totalPages = Math.ceil(sentences.length / sentencesPerPage);
  const startIndex = (currentPage - 1) * sentencesPerPage;
  const endIndex = startIndex + sentencesPerPage;
  const currentSentences = sentences.slice(startIndex, endIndex);

  useEffect(() => {
    // When view mode changes, clear all cached measurements
    // and force the list to re-render.
    cache.current.clearAll();
    if (listRef.current) {
      listRef.current.forceUpdateGrid();
    }
  }, [viewMode]);

  // Clear cache when translations change to handle height adjustments
  useEffect(() => {
    // When translations are added/removed, clear cache to recalculate heights
    cache.current.clearAll();
    if (listRef.current) {
      listRef.current.forceUpdateGrid();
    }
  }, [translatedSentences]);

  // Load reading progress
  useEffect(() => {
    if (user && analysisId) {
      const loadProgress = async () => {
        try {
          const progressRef = doc(
            db,
            "readingProgress",
            `${user.uid}_${analysisId}`
          );
          const progressSnap = await getDoc(progressRef);
          if (progressSnap.exists()) {
            const progress = progressSnap.data() as ReadingProgress;
            setCurrentPage(progress.currentPage);
          }
        } catch (error) {
          console.error("Error loading reading progress:", error);
        }
      };
      loadProgress();
    }
  }, [user, analysisId]);

  // Load user settings
  useEffect(() => {
    if (user) {
      const loadSettings = async () => {
        try {
          const settingsRef = doc(db, "userSettings", user.uid);
          const settingsSnap = await getDoc(settingsRef);
          if (settingsSnap.exists()) {
            const settings = settingsSnap.data() as UserSettings;
            setSentencesPerPage(settings.sentencesPerPage);
          }
        } catch (error) {
          console.error("Error loading user settings:", error);
        }
      };
      loadSettings();
    }
  }, [user]);

  // Save reading progress
  const saveProgress = async (page: number, sentenceIndex: number = 0) => {
    if (!user || !analysisId) return;

    try {
      const progressRef = doc(
        db,
        "readingProgress",
        `${user.uid}_${analysisId}`
      );
      const progress: ReadingProgress = {
        currentPage: page,
        currentSentenceIndex: sentenceIndex,
        lastReadAt: Timestamp.now(),
      };
      await setDoc(progressRef, progress);
    } catch (error) {
      console.error("Error saving reading progress:", error);
    }
  };

  // Save user settings
  const saveSettings = async (newSentencesPerPage: number) => {
    if (!user) return;

    try {
      const settingsRef = doc(db, "userSettings", user.uid);
      const settings: UserSettings = {
        sentencesPerPage: newSentencesPerPage,
      };
      await setDoc(settingsRef, settings);
      setSentencesPerPage(newSentencesPerPage);

      // Recalculate current page to maintain position
      const newTotalPages = Math.ceil(sentences.length / newSentencesPerPage);
      const newCurrentPage = Math.min(currentPage, newTotalPages);
      setCurrentPage(newCurrentPage);
      saveProgress(newCurrentPage);
    } catch (error) {
      console.error("Error saving user settings:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    saveProgress(newPage);
    // Clear cache and scroll to top when page changes
    cache.current.clearAll();
    if (listRef.current) {
      listRef.current.scrollToRow(0);
      listRef.current.forceUpdateGrid();
    }
  };

  // Clear cache when sentences per page changes
  useEffect(() => {
    cache.current.clearAll();
    if (listRef.current) {
      listRef.current.forceUpdateGrid();
    }
  }, [sentencesPerPage]);

  const handleWordClick = async (word: string) => {
    setSelectedWord({ word });
    setWordInfoLoading(true);

    try {
      // Fetch word info from multiple APIs
      const [freeDictResponse, datamuseResponse] = await Promise.allSettled([
        fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
            word
          )}`
        ),
        fetch(
          `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(
            word
          )}&max=5`
        ),
      ]);

      let definition = "";
      let translation = "";
      let details = {};

      if (
        freeDictResponse.status === "fulfilled" &&
        freeDictResponse.value.ok
      ) {
        try {
          const freeDictData = await freeDictResponse.value.json();
          if (freeDictData && freeDictData.length > 0) {
            definition =
              freeDictData[0].meanings?.[0]?.definitions?.[0]?.definition || "";
            details = { freeDictionary: freeDictData };
          }
        } catch (error) {
          console.error("Error parsing Free Dictionary API response:", error);
        }
      } else if (freeDictResponse.status === "fulfilled") {
        console.log(
          `Free Dictionary API returned ${freeDictResponse.value.status} for word "${word}"`
        );
      }

      if (
        datamuseResponse.status === "fulfilled" &&
        datamuseResponse.value.ok
      ) {
        try {
          const datamuseData = await datamuseResponse.value.json();
          details = { ...details, datamuse: datamuseData };
        } catch (error) {
          console.error("Error parsing Datamuse API response:", error);
        }
      }

      // Try to get translation
      try {
        const translationResponse = await fetch(
          `${config.translationApi.baseUrl}?q=${encodeURIComponent(
            word
          )}&langpair=en|uk`
        );
        const translationData = await translationResponse.json();
        translation = translationData.responseData?.translatedText || "";
      } catch (error) {
        console.error("Translation error:", error);
      }

      setSelectedWord({
        word,
        definition: definition || "No definition found",
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
      setWordInfoLoading(false);
    }
  };

  const reloadDefinition = async () => {
    if (!selectedWord) return;
    setReloadingDefinition(true);

    try {
      const [freeDictResponse, datamuseResponse] = await Promise.allSettled([
        fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
            selectedWord.word
          )}`
        ),
        fetch(
          `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(
            selectedWord.word
          )}&max=5`
        ),
      ]);

      let definition = "";
      let details = { ...selectedWord.details };

      if (
        freeDictResponse.status === "fulfilled" &&
        freeDictResponse.value.ok
      ) {
        try {
          const freeDictData = await freeDictResponse.value.json();
          if (freeDictData && freeDictData.length > 0) {
            definition =
              freeDictData[0].meanings?.[0]?.definitions?.[0]?.definition || "";
            details = { ...details, freeDictionary: freeDictData };
          }
        } catch (error) {
          console.error("Error parsing Free Dictionary API response:", error);
        }
      } else if (freeDictResponse.status === "fulfilled") {
        console.log(
          `Free Dictionary API returned ${freeDictResponse.value.status} for word "${selectedWord.word}"`
        );
      }

      if (
        datamuseResponse.status === "fulfilled" &&
        datamuseResponse.value.ok
      ) {
        try {
          const datamuseData = await datamuseResponse.value.json();
          details = { ...details, datamuse: datamuseData };
        } catch (error) {
          console.error("Error parsing Datamuse API response:", error);
        }
      }

      setSelectedWord({
        ...selectedWord,
        definition: definition || "No definition found",
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
      setReloadingDefinition(false);
    }
  };

  const reloadTranslation = async () => {
    if (!selectedWord) return;
    setReloadingTranslation(true);

    try {
      const translationResponse = await fetch(
        `${config.translationApi.baseUrl}?q=${encodeURIComponent(
          selectedWord.word
        )}&langpair=en|uk`
      );
      const translationData = await translationResponse.json();
      const translation = translationData.responseData?.translatedText || "";

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
      setReloadingTranslation(false);
    }
  };

  const handleTranslate = async (sentenceId: string, text: string) => {
    if (translatedSentences[sentenceId]) return;
    setTranslatingSentenceId(sentenceId);

    const sentenceIndex = sentences.findIndex((s) => s.id === sentenceId);

    try {
      const url = `${config.translationApi.baseUrl}?q=${encodeURIComponent(
        text
      )}&langpair=en|uk`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.responseData) {
        setTranslatedSentences((prev) => ({
          ...prev,
          [sentenceId]: data.responseData.translatedText,
        }));
      } else {
        throw new Error("Translation failed");
      }
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedSentences((prev) => ({
        ...prev,
        [sentenceId]: "Translation failed.",
      }));
    } finally {
      if (sentenceIndex !== -1) {
        // Add a small delay to ensure the DOM has updated before clearing cache
        setTimeout(() => {
          cache.current.clearAll();
          if (listRef.current) {
            listRef.current.forceUpdateGrid();
          }
        }, 50);
      }
      setTranslatingSentenceId(null);
    }
  };

  useEffect(() => {
    if (user && analysisId) {
      const fetchAnalysisDetails = async () => {
        try {
          setLoading(true);
          // Fetch analysis document
          const analysisRef = doc(db, "analyses", analysisId);
          const analysisSnap = await getDoc(analysisRef);

          if (
            !analysisSnap.exists() ||
            analysisSnap.data().userId !== user.uid
          ) {
            setError(
              "Analysis not found or you do not have permission to view it."
            );
            return;
          }
          setAnalysis({
            id: analysisSnap.id,
            ...analysisSnap.data(),
          } as Analysis);

          // Fetch sentences subcollection
          const sentencesRef = collection(analysisRef, "sentences");
          const q = query(sentencesRef, orderBy("index"));
          const sentencesSnap = await getDocs(q);
          const sentencesData = sentencesSnap.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Sentence)
          );
          setSentences(sentencesData);
        } catch (err) {
          console.error("Error fetching analysis details:", err);
          setError("Failed to load analysis details.");
        } finally {
          setLoading(false);
        }
      };

      fetchAnalysisDetails();
    }
  }, [user, analysisId]);

  // Highlight words in text and make them clickable
  const renderClickableText = (text: string) => {
    const words = text.split(/(\s+)/);
    return words.map((word, index) => {
      const cleanWord = word.replace(/[^\w]/g, "");
      if (cleanWord.length > 2) {
        return (
          <span key={index}>
            <button
              onClick={() => handleWordClick(cleanWord.toLowerCase())}
              className="hover:bg-yellow-200 dark:hover:bg-yellow-800 px-1 rounded transition-colors"
              title={`Click to see info about "${cleanWord}"`}
            >
              {word}
            </button>
          </span>
        );
      }
      return <span key={index}>{word}</span>;
    });
  };

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
    return null; // Or some other placeholder
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
        {!isFullScreen && (
          <div className="mb-8">
            <Link href="/analyses">
              <span className="text-blue-600 hover:underline text-sm">
                &larr; Back to My Analyses
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {analysis.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Analyzed on {analysis.createdAt.toDate().toLocaleDateString()}
            </p>
          </div>
        )}

        {!isFullScreen && (
          /* Summary Cards */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Words
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {analysis.summary.totalWords.toLocaleString()}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Unique Words
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {analysis.summary.uniqueWords.toLocaleString()}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Known Words
              </div>
              <div className="text-2xl font-bold text-green-600">
                {analysis.summary.knownWords.toLocaleString()}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Unknown Words
              </div>
              <div className="text-2xl font-bold text-red-600">
                {analysis.summary.unknownWords.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Sentences List */}
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${
            isFullScreen ? "flex-1 flex flex-col" : ""
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sentences ({sentences.length}) - Page {currentPage} of{" "}
              {totalPages}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode("columns")}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  viewMode === "columns"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Columns
              </button>
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="px-3 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                {isFullScreen ? "Exit Full Screen" : "Full Screen"}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-3 py-1.5 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700"
                title="Reading Settings"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className={`${isFullScreen ? "flex-1" : "h-[600px]"}`}>
            <AutoSizer>
              {({ width, height }) => (
                <List
                  ref={listRef}
                  className="sentence-list"
                  width={width}
                  height={height}
                  rowCount={currentSentences.length}
                  deferredMeasurementCache={cache.current}
                  rowHeight={cache.current.rowHeight}
                  rowRenderer={({ index, key, style, parent }) => {
                    const sentence = currentSentences[index];
                    const translation = translatedSentences[sentence.id];
                    const isTranslating = translatingSentenceId === sentence.id;
                    const globalIndex = startIndex + index;

                    return (
                      <CellMeasurer
                        key={key}
                        cache={cache.current}
                        parent={parent}
                        columnIndex={0}
                        rowIndex={index}
                      >
                        <div style={style} className="py-2 pr-2">
                          <div className="flex items-start">
                            <span className="text-gray-500 dark:text-gray-400 text-base mr-4 w-8 pt-1">
                              {globalIndex + 1}.
                            </span>
                            <div className="flex-1">
                              {viewMode === "columns" && (
                                <div className="grid grid-cols-2 gap-4">
                                  <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                                    {renderClickableText(sentence.text)}
                                  </p>
                                  <div className="border-l border-gray-200 dark:border-gray-700 pl-4">
                                    {translation && (
                                      <p className="text-blue-500 dark:text-blue-400 text-lg leading-relaxed">
                                        {translation}
                                      </p>
                                    )}
                                    {!translation && (
                                      <button
                                        onClick={() =>
                                          handleTranslate(
                                            sentence.id,
                                            sentence.text
                                          )
                                        }
                                        disabled={isTranslating}
                                        className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                                      >
                                        {isTranslating
                                          ? "Translating..."
                                          : "Translate"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                              {viewMode === "list" && (
                                <div>
                                  <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                                    {renderClickableText(sentence.text)}
                                  </p>
                                  <div className="mt-3">
                                    {translation && (
                                      <p className="text-blue-500 dark:text-blue-400 text-base leading-relaxed pl-3 border-l-2 border-blue-500">
                                        {translation}
                                      </p>
                                    )}
                                    {!translation && (
                                      <button
                                        onClick={() =>
                                          handleTranslate(
                                            sentence.id,
                                            sentence.text
                                          )
                                        }
                                        disabled={isTranslating}
                                        className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                                      >
                                        {isTranslating
                                          ? "Translating..."
                                          : "Translate"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CellMeasurer>
                    );
                  }}
                  overscanRowCount={5}
                />
              )}
            </AutoSizer>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Word Info Modal */}
      {selectedWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedWord.word}
                </h3>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {wordInfoLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Loading word info...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedWord.definition && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Definition
                        </h4>
                        <button
                          onClick={reloadDefinition}
                          disabled={reloadingDefinition}
                          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {reloadingDefinition ? "Reloading..." : "Reload"}
                        </button>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedWord.definition}
                      </p>
                    </div>
                  )}

                  {selectedWord.translation && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Translation
                        </h4>
                        <button
                          onClick={reloadTranslation}
                          disabled={reloadingTranslation}
                          className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {reloadingTranslation ? "Reloading..." : "Reload"}
                        </button>
                      </div>
                      <p className="text-blue-600 dark:text-blue-400">
                        {selectedWord.translation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Reading Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sentences per page
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={sentencesPerPage}
                      onChange={(e) =>
                        setSentencesPerPage(Number(e.target.value))
                      }
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[3rem]">
                      {sentencesPerPage}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Choose how many sentences to display on each page
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      saveSettings(sentencesPerPage);
                      setShowSettings(false);
                    }}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

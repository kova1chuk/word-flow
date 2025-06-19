"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

interface Word {
  id: string;
  word: string;
  definition: string;
  example: string;
  createdAt: Timestamp;
  status: string;
}

interface AnalysisResult {
  totalWords: number;
  uniqueWords: number;
  knownWords: number;
  unknownWords: number;
  unknownWordList: string[];
  wordFrequency: { [key: string]: number };
}

interface TranslationResult {
  word: string;
  translation: string;
  explanation: string;
}

export default function AnalyzePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userWords, setUserWords] = useState<Word[]>([]);
  const [inputText, setInputText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [addingWords, setAddingWords] = useState(false);
  const [error, setError] = useState("");
  const [translations, setTranslations] = useState<TranslationResult[]>([]);
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [addingWord, setAddingWord] = useState<string | null>(null);
  const [frequencyStatusFilters, setFrequencyStatusFilters] = useState<
    string[]
  >(["all"]);
  const [allWordsPage, setAllWordsPage] = useState(1);
  const [wellKnownWordsPage, setWellKnownWordsPage] = useState(1);
  const wordsPerPage = 10;

  const STATUS_OPTIONS = [
    { value: "well_known", label: "Well Known", color: "bg-green-500" },
    { value: "want_repeat", label: "Want Repeat", color: "bg-orange-400" },
    { value: "to_learn", label: "To Learn", color: "bg-blue-600" },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
      return;
    }

    if (user) {
      fetchUserWords();
    }
  }, [user, loading, router]);

  // Close tooltip on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setActiveTooltip(null);
      }
    }
    if (activeTooltip !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeTooltip]);

  const fetchUserWords = async () => {
    if (!user) return;

    try {
      const wordsRef = collection(db, "words");
      const q = query(wordsRef, where("userId", "==", user.uid));

      const querySnapshot = await getDocs(q);
      const wordsData: Word[] = [];

      querySnapshot.forEach((doc) => {
        wordsData.push({
          id: doc.id,
          ...doc.data(),
        } as Word);
      });

      setUserWords(wordsData);
    } catch (error) {
      console.error("Error fetching user words:", error);
      setError("Failed to load your word collection");
    }
  };

  const analyzeText = () => {
    if (!inputText.trim()) {
      setError("Please enter some text to analyze");
      return;
    }

    setLoadingAnalysis(true);
    setError("");

    try {
      // Clean and split text into words
      const words = inputText
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 0);

      // Count word frequency
      const wordFrequency: { [key: string]: number } = {};
      words.forEach((word) => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });

      const uniqueWords = Object.keys(wordFrequency);
      const userKnownWords = userWords.map((w) => w.word.toLowerCase().trim());

      // Categorize words
      const knownWords = uniqueWords.filter((word) =>
        userKnownWords.includes(word)
      );
      const unknownWords = uniqueWords.filter(
        (word) => !userKnownWords.includes(word)
      );

      const result: AnalysisResult = {
        totalWords: words.length,
        uniqueWords: uniqueWords.length,
        knownWords: knownWords.length,
        unknownWords: unknownWords.length,
        unknownWordList: unknownWords,
        wordFrequency,
      };

      setAnalysisResult(result);
    } catch (error) {
      console.error("Error analyzing text:", error);
      setError("Failed to analyze text");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const addUnknownWords = async () => {
    if (!user || !analysisResult) return;

    try {
      setAddingWords(true);
      setError("");

      const wordsRef = collection(db, "words");
      // Create a map for quick lookup of explanations
      const explanationMap: Record<string, string> = {};
      translations.forEach((t) => {
        explanationMap[t.word.toLowerCase()] = t.explanation;
      });

      const promises = analysisResult.unknownWordList.map((word) => {
        const def =
          explanationMap[word.toLowerCase()] &&
          explanationMap[word.toLowerCase()] !== "No definition found."
            ? explanationMap[word.toLowerCase()]
            : `[Auto-added from text analysis]`;
        return addDoc(wordsRef, {
          userId: user.uid,
          word: word.trim(),
          definition: def,
          example: "",
          createdAt: Timestamp.now(),
        });
      });

      await Promise.all(promises);
      // Refresh user words
      await fetchUserWords();
      // Re-analyze text to update results
      setInputText(inputText);
      analyzeText();
    } catch {
      setError("Failed to add unknown words");
    } finally {
      setAddingWords(false);
    }
  };

  // Fetch explanations (definitions) for unknown words using DictionaryAPI.dev
  const fetchTranslations = async () => {
    if (!analysisResult || analysisResult.unknownWordList.length === 0) return;
    setLoadingTranslations(true);
    setTranslations([]);
    try {
      const results: TranslationResult[] = [];
      for (const word of analysisResult.unknownWordList) {
        // Fetch English definition from DictionaryAPI.dev
        let explanation = "";
        try {
          const res = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
              word
            )}`
          );
          if (res.ok) {
            const data = await res.json();
            if (
              Array.isArray(data) &&
              data[0]?.meanings?.[0]?.definitions?.[0]?.definition
            ) {
              explanation = data[0].meanings[0].definitions[0].definition;
            } else {
              explanation = "No definition found.";
            }
          } else {
            explanation = "No definition found.";
          }
        } catch {
          explanation = "No definition found.";
        }
        results.push({ word, translation: "", explanation });
      }
      setTranslations(results);
    } catch {
      setTranslations([]);
    } finally {
      setLoadingTranslations(false);
    }
  };

  const addSingleWord = async (word: string, status?: string) => {
    if (!user) return;

    try {
      setAddingWord(word);
      const wordsRef = collection(db, "words");

      // Check if word already exists
      const wordExists = userWords.some(
        (w) => w.word.toLowerCase().trim() === word.toLowerCase().trim()
      );

      if (wordExists) {
        setError("This word already exists in your collection");
        return;
      }

      let definition = "";
      // Try to get definition from translations first
      const translationDef = translations.find(
        (t) => t.word.toLowerCase() === word.toLowerCase()
      )?.explanation;

      if (translationDef && translationDef !== "No definition found.") {
        definition = translationDef;
      } else {
        // If no translation, try to fetch definition
        try {
          const res = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
              word
            )}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data[0]?.meanings?.[0]?.definitions?.[0]?.definition) {
              definition = data[0].meanings[0].definitions[0].definition;
            }
          }
        } catch (error) {
          console.error("Error fetching definition:", error);
        }
      }

      // Add the word
      const newWordDoc = await addDoc(wordsRef, {
        userId: user.uid,
        word: word.trim(),
        definition: definition || "[Auto-added from text analysis]",
        example: "",
        createdAt: Timestamp.now(),
        status: status || "to_learn",
      });

      // Update local state
      const newWord = {
        id: newWordDoc.id,
        word: word.trim(),
        definition: definition || "[Auto-added from text analysis]",
        example: "",
        createdAt: Timestamp.now(),
        status: status || "to_learn",
      };

      setUserWords((prev) => [...prev, newWord]);

      // Update analysis result
      if (analysisResult) {
        const updatedResult = { ...analysisResult };
        const wordLower = word.toLowerCase().trim();

        // Remove from unknown words
        updatedResult.unknownWordList = updatedResult.unknownWordList.filter(
          (w) => w.toLowerCase() !== wordLower
        );
        updatedResult.unknownWords = updatedResult.unknownWords - 1;
        updatedResult.knownWords = updatedResult.knownWords + 1;

        setAnalysisResult(updatedResult);
      }

      setActiveTooltip(null); // Close tooltip after adding
    } catch (error) {
      console.error("Error adding word:", error);
      setError("Failed to add word");
    } finally {
      setAddingWord(null);
    }
  };

  const updateWordStatus = async (wordId: string, status: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "words", wordId), { status });

      // Update local state
      setUserWords((prev) =>
        prev.map((word) => (word.id === wordId ? { ...word, status } : word))
      );

      setActiveTooltip(null); // Close tooltip after updating
    } catch (error) {
      console.error("Error updating word status:", error);
      setError("Failed to update word status");
    }
  };

  const toggleFrequencyStatusFilter = (status: string) => {
    setFrequencyStatusFilters((prev) => {
      if (status === "all") {
        return ["all"];
      }
      const newFilters = prev.filter((f) => f !== "all");
      if (prev.includes(status)) {
        const filtered = newFilters.filter((f) => f !== status);
        return filtered.length === 0 ? ["all"] : filtered;
      }
      return [...newFilters, status];
    });
  };

  const filterWordsByStatus = (words: [string, number][]) => {
    if (frequencyStatusFilters.includes("all")) return words;

    return words.filter(([word]) => {
      const existingWord = userWords.find(
        (w) => w.word.toLowerCase().trim() === word.toLowerCase()
      );

      if (!existingWord && frequencyStatusFilters.includes("unknown")) {
        return true;
      }

      if (
        existingWord &&
        frequencyStatusFilters.includes(existingWord.status || "unset")
      ) {
        return true;
      }

      return false;
    });
  };

  const getPaginatedWords = (
    words: [string, number][],
    currentPage: number
  ) => {
    const startIndex = (currentPage - 1) * wordsPerPage;
    const endIndex = startIndex + wordsPerPage;
    return words.slice(startIndex, endIndex);
  };

  const getTotalPages = (words: [string, number][]) => {
    return Math.ceil(words.length / wordsPerPage);
  };

  const wellKnownWords = analysisResult
    ? Object.entries(analysisResult.wordFrequency)
        .filter(([word]) =>
          userWords.some(
            (w) =>
              w.word.toLowerCase().trim() === word.toLowerCase() &&
              w.status === "well_known"
          )
        )
        .sort(([, a], [, b]) => b - a)
    : [];

  const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
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
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  currentPage === pageNum
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Analyze Text
          </h1>
          <p className="text-gray-600">
            Analyze text to identify known and unknown words
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Enter Text
            </h2>
            <div className="space-y-4">
              {!analysisResult ? (
                <div>
                  <label
                    htmlFor="text-input"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Text to Analyze
                  </label>
                  <textarea
                    id="text-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base leading-relaxed bg-white placeholder-gray-500 resize-none"
                    placeholder="Paste or type your text here..."
                  />
                </div>
              ) : (
                <div className="prose max-w-none bg-gray-50 p-4 rounded border">
                  {(() => {
                    // Split original text into words and spaces
                    const words =
                      inputText.match(/\w+|\s+|[^"]\w*|[.,!?;:]/g) || [];
                    const unknownSet = new Set(
                      analysisResult.unknownWordList.map((w) => w.toLowerCase())
                    );
                    const knownMap = new Map(
                      userWords.map((w) => [
                        w.word.toLowerCase().trim(),
                        { definition: w.definition, status: w.status },
                      ])
                    );
                    const explanationMap: Record<string, string> = {};
                    translations.forEach((t) => {
                      explanationMap[t.word.toLowerCase()] = t.explanation;
                    });
                    return words.map((w, i) => {
                      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, "");
                      let tooltip = null;
                      const isWord = /\w+/.test(w);
                      let definition = "";
                      let colorClass = "";
                      let existingWord = null;

                      if (unknownSet.has(clean)) {
                        definition =
                          explanationMap[clean] &&
                          explanationMap[clean] !== "No definition found."
                            ? explanationMap[clean]
                            : "No definition";
                        colorClass = "bg-red-100 text-red-700";
                      } else if (knownMap.has(clean)) {
                        const wordInfo = knownMap.get(clean);
                        definition = wordInfo?.definition || "No definition";
                        colorClass =
                          wordInfo?.status === "well_known"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700";
                        existingWord = userWords.find(
                          (uw) => uw.word.toLowerCase().trim() === clean
                        );
                      }

                      if (isWord) {
                        tooltip =
                          activeTooltip === i ? (
                            <div
                              ref={tooltipRef}
                              className="absolute z-50 mt-2 left-1/2 -translate-x-1/2 bg-white border border-gray-300 shadow-lg rounded-lg px-4 py-3 text-sm text-gray-900 min-w-[250px] max-w-sm"
                            >
                              <div className="font-semibold mb-2 text-base">
                                {w}
                              </div>
                              <div className="mb-3">{definition}</div>

                              {existingWord ? (
                                <>
                                  <div className="mb-2 text-xs font-medium text-gray-500">
                                    Change status:
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {STATUS_OPTIONS.map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() =>
                                          updateWordStatus(
                                            existingWord.id,
                                            option.value
                                          )
                                        }
                                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                          existingWord.status === option.value
                                            ? `${option.color} text-white`
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="mb-2 text-xs font-medium text-gray-500">
                                    Add to dictionary with status:
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {STATUS_OPTIONS.map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() =>
                                          addSingleWord(w, option.value)
                                        }
                                        disabled={addingWord === w}
                                        className={`px-2 py-1 rounded text-xs font-medium ${option.color} text-white hover:opacity-90 disabled:opacity-50 transition-colors`}
                                      >
                                        {addingWord === w
                                          ? "Adding..."
                                          : option.label}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          ) : null;

                        return (
                          <span
                            key={i}
                            className={`relative ${colorClass} rounded px-1 mx-0.5 inline-block cursor-pointer`}
                            onClick={() =>
                              setActiveTooltip(activeTooltip === i ? null : i)
                            }
                          >
                            {w}
                            {tooltip}
                          </span>
                        );
                      }
                      return <span key={i}>{w}</span>;
                    });
                  })()}
                </div>
              )}
              <button
                onClick={analyzeText}
                disabled={loadingAnalysis || !inputText.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingAnalysis ? "Analyzing..." : "Analyze Text"}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Analysis Results
            </h2>

            {!analysisResult ? (
              <div className="text-center py-8 text-gray-500">
                <p>
                  Enter text and click &ldquo;Analyze Text&rdquo; to see results
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResult.totalWords}
                    </div>
                    <div className="text-sm text-blue-700">Total Words</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analysisResult.uniqueWords}
                    </div>
                    <div className="text-sm text-green-700">Unique Words</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {analysisResult.knownWords}
                    </div>
                    <div className="text-sm text-purple-700">Known Words</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {analysisResult.unknownWords}
                    </div>
                    <div className="text-sm text-orange-700">Unknown Words</div>
                  </div>
                </div>

                {/* Unknown Words Section */}
                {analysisResult.unknownWords > 0 && (
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Unknown Words ({analysisResult.unknownWords})
                      </h3>
                      <button
                        onClick={addUnknownWords}
                        disabled={addingWords}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addingWords ? "Adding..." : "Add All to My Words"}
                      </button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.unknownWordList.map((word, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 px-2 py-1 rounded text-sm border text-gray-900 font-medium"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Known Words Section */}
                {analysisResult.knownWords > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Known Words ({analysisResult.knownWords})
                    </h3>
                    <div className="space-y-4">
                      {/* Well Known Words */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Well Known:
                        </h4>
                        <div className="bg-green-50 p-4 rounded-lg max-h-32 overflow-y-auto">
                          <div className="flex flex-wrap gap-2">
                            {wellKnownWords.map(([word]) => (
                              <span
                                key={word}
                                className="bg-green-100 px-2 py-1 rounded text-sm border border-green-200 text-green-800 font-medium"
                              >
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* In Dictionary Words */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          In Dictionary:
                        </h4>
                        <div className="bg-blue-50 p-4 rounded-lg max-h-32 overflow-y-auto">
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              const inDictWords = Object.keys(
                                analysisResult.wordFrequency
                              ).filter((word) =>
                                userWords.some(
                                  (uw) =>
                                    uw.word.toLowerCase().trim() ===
                                      word.toLowerCase() &&
                                    uw.status !== "well_known"
                                )
                              );
                              return inDictWords.map((word, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-100 px-2 py-1 rounded text-sm border border-blue-200 text-blue-800 font-medium"
                                >
                                  {word}
                                </span>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Word Frequency */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Word Frequency
                  </h3>

                  {/* Status Filters */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Filter by status:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleFrequencyStatusFilter("all")}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          frequencyStatusFilters.includes("all")
                            ? "bg-gray-800 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        All Words
                      </button>
                      <button
                        onClick={() => toggleFrequencyStatusFilter("unknown")}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          frequencyStatusFilters.includes("unknown")
                            ? "bg-red-600 text-white"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                        }`}
                      >
                        Unknown
                      </button>
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            toggleFrequencyStatusFilter(option.value)
                          }
                          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            frequencyStatusFilters.includes(option.value)
                              ? `${option.color} text-white`
                              : `bg-${option.color.split("-")[1]}-50 hover:bg-${
                                  option.color.split("-")[1]
                                }-100 text-${option.color.split("-")[1]}-700`
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                      <button
                        onClick={() => toggleFrequencyStatusFilter("unset")}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          frequencyStatusFilters.includes("unset")
                            ? "bg-gray-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        No Status
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* All Words */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        All Words (
                        {
                          filterWordsByStatus(
                            Object.entries(analysisResult.wordFrequency)
                          ).length
                        }{" "}
                        words)
                      </h4>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Word
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Count
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {getPaginatedWords(
                              filterWordsByStatus(
                                Object.entries(analysisResult.wordFrequency)
                              ).sort(([, a], [, b]) => b - a),
                              allWordsPage
                            ).map(([word, count]) => {
                              const existingWord = userWords.find(
                                (w) =>
                                  w.word.toLowerCase().trim() ===
                                  word.toLowerCase()
                              );
                              const isUnknown = !existingWord;

                              return (
                                <tr key={word} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm">
                                    <span
                                      className={`inline-block px-2 py-1 rounded ${
                                        isUnknown
                                          ? "bg-red-100 text-red-700"
                                          : existingWord?.status ===
                                            "well_known"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {word}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-500">
                                    {count}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {isUnknown ? (
                                      <span className="text-red-600 text-xs">
                                        Not in dictionary
                                      </span>
                                    ) : (
                                      <span
                                        className={`text-xs font-medium ${
                                          existingWord.status === "well_known"
                                            ? "text-green-600"
                                            : existingWord.status ===
                                              "want_repeat"
                                            ? "text-orange-600"
                                            : "text-blue-600"
                                        }`}
                                      >
                                        {STATUS_OPTIONS.find(
                                          (opt) =>
                                            opt.value === existingWord.status
                                        )?.label || "No Status"}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-right">
                                    <div className="flex justify-end gap-1">
                                      {isUnknown
                                        ? STATUS_OPTIONS.map((option) => (
                                            <button
                                              key={option.value}
                                              onClick={() =>
                                                addSingleWord(
                                                  word,
                                                  option.value
                                                )
                                              }
                                              disabled={addingWord === word}
                                              className={`px-2 py-1 rounded text-xs font-medium ${option.color} text-white hover:opacity-90 disabled:opacity-50 transition-colors`}
                                            >
                                              {addingWord === word
                                                ? "..."
                                                : option.label}
                                            </button>
                                          ))
                                        : STATUS_OPTIONS.map((option) => (
                                            <button
                                              key={option.value}
                                              onClick={() =>
                                                updateWordStatus(
                                                  existingWord.id,
                                                  option.value
                                                )
                                              }
                                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                                existingWord.status ===
                                                option.value
                                                  ? `${option.color} text-white`
                                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                              }`}
                                            >
                                              {option.label}
                                            </button>
                                          ))}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <Pagination
                          currentPage={allWordsPage}
                          totalPages={getTotalPages(
                            filterWordsByStatus(
                              Object.entries(analysisResult.wordFrequency)
                            )
                          )}
                          onPageChange={setAllWordsPage}
                        />
                      </div>
                    </div>

                    {/* Well Known Words */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Well Known Words ({wellKnownWords.length} words)
                      </h4>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Word
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Count
                              </th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {getPaginatedWords(
                              wellKnownWords,
                              wellKnownWordsPage
                            ).map(([word]) => (
                              <tr key={word} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm">
                                  <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700">
                                    {word}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {analysisResult.wordFrequency[word]}
                                </td>
                                <td className="px-4 py-2 text-sm text-right">
                                  <div className="flex justify-end gap-1">
                                    {STATUS_OPTIONS.map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() => {
                                          const existingWord = userWords.find(
                                            (w) =>
                                              w.word.toLowerCase().trim() ===
                                              word.toLowerCase()
                                          );
                                          if (existingWord) {
                                            updateWordStatus(
                                              existingWord.id,
                                              option.value
                                            );
                                          }
                                        }}
                                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                          option.value === "well_known"
                                            ? `${option.color} text-white`
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <Pagination
                          currentPage={wellKnownWordsPage}
                          totalPages={getTotalPages(wellKnownWords)}
                          onPageChange={setWellKnownWordsPage}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Translations Section */}
        {analysisResult && analysisResult.unknownWords > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Unknown Word Translations & Explanations
              </h2>
              <button
                onClick={fetchTranslations}
                disabled={loadingTranslations}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingTranslations ? "Translating..." : "Fetch Translations"}
              </button>
            </div>
            {translations.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                        Word
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                        Translation
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                        Explanation
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {translations.map((t) => (
                      <tr key={t.word}>
                        <td className="px-4 py-2 text-gray-900 font-medium">
                          {t.word}
                        </td>
                        <td className="px-4 py-2 text-green-700">
                          {t.translation}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {t.explanation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {loadingTranslations && (
              <div className="text-gray-500 mt-4">Fetching translations...</div>
            )}
            {!loadingTranslations && translations.length === 0 && (
              <div className="text-gray-500 mt-4">
                No translations fetched yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

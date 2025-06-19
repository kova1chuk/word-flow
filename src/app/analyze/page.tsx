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
        .replace(/[^\w\s]/g, " ") // Remove punctuation
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
                      }
                      if (
                        isWord &&
                        (unknownSet.has(clean) || knownMap.has(clean))
                      ) {
                        tooltip =
                          activeTooltip === i ? (
                            <div
                              ref={tooltipRef}
                              className="absolute z-50 mt-2 left-1/2 -translate-x-1/2 bg-white border border-gray-300 shadow-lg rounded px-3 py-2 text-sm text-gray-900 min-w-[180px] max-w-xs"
                            >
                              <div className="font-semibold mb-1">{w}</div>
                              <div>{definition}</div>
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
                            {(() => {
                              const wellKnownWords = Object.keys(
                                analysisResult.wordFrequency
                              ).filter((word) =>
                                userWords.some(
                                  (uw) =>
                                    uw.word.toLowerCase().trim() ===
                                      word.toLowerCase() &&
                                    uw.status === "well_known"
                                )
                              );
                              return wellKnownWords.map((word, index) => (
                                <span
                                  key={index}
                                  className="bg-green-100 px-2 py-1 rounded text-sm border border-green-200 text-green-800 font-medium"
                                >
                                  {word}
                                </span>
                              ));
                            })()}
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
                    Word Frequency (Top 10)
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(analysisResult.wordFrequency)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 10)
                      .map(([word, count]) => (
                        <div
                          key={word}
                          className="flex justify-between items-center"
                        >
                          <span
                            className="text-sm font-medium"
                            style={{ color: "#000", fontWeight: 500 }}
                          >
                            {word}
                          </span>
                          <span className="text-sm text-gray-500">{count}</span>
                        </div>
                      ))}
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

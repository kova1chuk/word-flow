"use client";

import { useState, useEffect } from "react";
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
}

interface AnalysisResult {
  totalWords: number;
  uniqueWords: number;
  knownWords: number;
  unknownWords: number;
  unknownWordList: string[];
  wordFrequency: { [key: string]: number };
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

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
      return;
    }

    if (user) {
      fetchUserWords();
    }
  }, [user, loading, router]);

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
      const promises = analysisResult.unknownWordList.map((word) =>
        addDoc(wordsRef, {
          userId: user.uid,
          word: word.trim(),
          definition: `[Auto-added from text analysis]`,
          example: "",
          createdAt: Timestamp.now(),
        })
      );

      await Promise.all(promises);

      // Refresh user words
      await fetchUserWords();

      // Re-analyze text to update results
      setInputText(inputText);
      analyzeText();
    } catch (error) {
      console.error("Error adding unknown words:", error);
      setError("Failed to add unknown words");
    } finally {
      setAddingWords(false);
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
      </div>
    </div>
  );
}

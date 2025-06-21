"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
  collectionGroup,
  limit,
  startAfter,
  Timestamp,
} from "firebase/firestore";

interface Analysis {
  id: string;
  title: string;
  createdAt: Timestamp;
  summary: {
    totalWords: number;
    uniqueWords: number;
    knownWords: number;
    unknownWords: number;
    averageWordLength: number;
    readingTime: number;
  };
}

interface Sentence {
  id: string;
  text: string;
  index: number;
  wordCount?: number;
  chapter?: string;
  hasUnknownWords?: boolean;
}

export default function AnalysesPage() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(
    null
  );
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSentences, setLoadingSentences] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterChapter, setFilterChapter] = useState("");
  const [filterHasUnknownWords, setFilterHasUnknownWords] = useState(false);
  const sentencesPerPage = 20;

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const analysesRef = collection(db, "analyses");
      const q = query(
        analysesRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const analysesData: Analysis[] = [];
      querySnapshot.forEach((doc) => {
        analysesData.push({
          id: doc.id,
          ...doc.data(),
        } as Analysis);
      });

      setAnalyses(analysesData);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      setError("Failed to load analyses");
    } finally {
      setLoading(false);
    }
  };

  const fetchSentences = async (analysisId: string) => {
    if (!user) return;

    try {
      setLoadingSentences(true);
      const sentencesRef = collection(db, "analyses", analysisId, "sentences");

      const q = query(sentencesRef, orderBy("index"), limit(sentencesPerPage));

      const querySnapshot = await getDocs(q);
      const sentencesData: Sentence[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sentencesData.push({
          id: doc.id,
          text: data.text,
          index: data.index,
          wordCount: data.text.split(/\s+/).length,
          chapter: data.chapter || "Unknown",
          hasUnknownWords: data.hasUnknownWords || false,
        });
      });

      setSentences(sentencesData);
    } catch (error) {
      console.error("Error fetching sentences:", error);
      setError("Failed to load sentences");
    } finally {
      setLoadingSentences(false);
    }
  };

  const handleAnalysisSelect = async (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    await fetchSentences(analysis.id);
  };

  const filteredSentences = sentences.filter((sentence) => {
    const matchesSearch = sentence.text
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesChapter = !filterChapter || sentence.chapter === filterChapter;
    const matchesUnknownWords =
      !filterHasUnknownWords || sentence.hasUnknownWords;

    return matchesSearch && matchesChapter && matchesUnknownWords;
  });

  const chapters = Array.from(new Set(sentences.map((s) => s.chapter))).sort();

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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Analyses</h1>
          <p className="text-gray-600">
            View your saved text analyses and sentences
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Analyses List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Analyses
              </h2>

              {analyses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No analyses found. Create your first analysis in the Analyze
                  page.
                </p>
              ) : (
                <div className="space-y-3">
                  {analyses.map((analysis) => (
                    <button
                      key={analysis.id}
                      onClick={() => handleAnalysisSelect(analysis)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedAnalysis?.id === analysis.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <h3 className="font-medium text-gray-900 mb-1">
                        {analysis.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {analysis.createdAt.toDate().toLocaleDateString()}
                      </p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>
                          Total words:{" "}
                          {analysis.summary.totalWords.toLocaleString()}
                        </p>
                        <p>
                          Unique words:{" "}
                          {analysis.summary.uniqueWords.toLocaleString()}
                        </p>
                        <p>
                          Unknown words:{" "}
                          {analysis.summary.unknownWords.toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sentences View */}
          <div className="lg:col-span-2">
            {selectedAnalysis ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedAnalysis.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedAnalysis.createdAt.toDate().toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {sentences.length} sentences loaded
                    </p>
                  </div>
                </div>

                {/* Filters */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        placeholder="Search sentences..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <select
                      value={filterChapter}
                      onChange={(e) => setFilterChapter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All chapters</option>
                      {chapters.map((chapter) => (
                        <option key={chapter} value={chapter}>
                          {chapter}
                        </option>
                      ))}
                    </select>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filterHasUnknownWords}
                        onChange={(e) =>
                          setFilterHasUnknownWords(e.target.checked)
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        Has unknown words
                      </span>
                    </label>
                  </div>
                </div>

                {/* Sentences List */}
                {loadingSentences ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSentences.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No sentences match your filters.
                      </p>
                    ) : (
                      filteredSentences.map((sentence) => (
                        <div
                          key={sentence.id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-gray-500">
                              Sentence {sentence.index + 1}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {sentence.wordCount} words
                              </span>
                              {sentence.hasUnknownWords && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                  Has unknown words
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-900 leading-relaxed">
                            {sentence.text}
                          </p>
                          {sentence.chapter &&
                            sentence.chapter !== "Unknown" && (
                              <p className="text-xs text-blue-600 mt-2">
                                Chapter: {sentence.chapter}
                              </p>
                            )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No analysis selected
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select an analysis from the list to view its sentences.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

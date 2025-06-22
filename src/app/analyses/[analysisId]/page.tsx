"use client";

import { useState, useEffect } from "react";
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
} from "firebase/firestore";
import Link from "next/link";
import { FixedSizeList as List } from "react-window";
import { config } from "@/lib/config";

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

export default function SingleAnalysisPage({
  params,
}: {
  params: { analysisId: string };
}) {
  const { user } = useAuth();
  const { analysisId } = params;

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

  const handleTranslate = async (sentenceId: string, text: string) => {
    if (translatedSentences[sentenceId]) return; // Already translated
    setTranslatingSentenceId(sentenceId);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
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

        {/* Summary Cards */}
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

        {/* Sentences List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sentences ({sentences.length})
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
            </div>
          </div>
          <div className="h-[600px]">
            <List
              height={600}
              itemCount={sentences.length}
              itemSize={viewMode === "list" ? 100 : 80}
              width="100%"
              className="dark:scrollbar-track-gray-700 dark:scrollbar-thumb-gray-500"
            >
              {({ index, style }) => {
                const sentence = sentences[index];
                const translation = translatedSentences[sentence.id];
                const isTranslating = translatingSentenceId === sentence.id;

                return (
                  <div style={style} className="py-2 pr-2">
                    <div className="flex items-start text-lg">
                      <span className="text-gray-500 dark:text-gray-400 text-base mr-4 w-8 pt-1">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        {/* Two Columns View */}
                        {viewMode === "columns" && (
                          <div className="grid grid-cols-2 gap-4">
                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                              {sentence.text}
                            </p>
                            <div className="border-l border-gray-200 dark:border-gray-700 pl-4">
                              {translation && (
                                <p className="text-blue-500 dark:text-blue-400 leading-relaxed">
                                  {translation}
                                </p>
                              )}
                              {!translation && (
                                <button
                                  onClick={() =>
                                    handleTranslate(sentence.id, sentence.text)
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
                        {/* List View */}
                        {viewMode === "list" && (
                          <div>
                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                              {sentence.text}
                            </p>
                            <div className="mt-2">
                              {translation && (
                                <p className="text-blue-500 dark:text-blue-400 text-base leading-relaxed pl-2 border-l-2 border-blue-500">
                                  {translation}
                                </p>
                              )}
                              {!translation && (
                                <button
                                  onClick={() =>
                                    handleTranslate(sentence.id, sentence.text)
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
                );
              }}
            </List>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-[600px]">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Sentences ({sentences.length})
          </h2>
          <List
            height={550}
            itemCount={sentences.length}
            itemSize={50}
            width="100%"
            className="dark:scrollbar-track-gray-700 dark:scrollbar-thumb-gray-500"
          >
            {({ index, style }) => (
              <div
                style={style}
                className="flex items-center border-b border-gray-200 dark:border-gray-700 p-2"
              >
                <span className="text-gray-500 dark:text-gray-400 text-sm mr-4 w-8">
                  {index + 1}.
                </span>
                <p className="text-gray-800 dark:text-gray-200">
                  {sentences[index].text}
                </p>
              </div>
            )}
          </List>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import Link from "next/link";
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
    averageWordLength: number;
    readingTime: number;
  };
}

export default function AnalysesPage() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalyses = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const analysesRef = collection(db, "analyses");
      const q = query(analysesRef, where("userId", "==", user.uid));

      const querySnapshot = await getDocs(q);
      const analysesData: Analysis[] = [];
      querySnapshot.forEach((doc) => {
        analysesData.push({
          id: doc.id,
          ...doc.data(),
        } as Analysis);
      });

      // Sort by creation date, newest first
      analysesData.sort(
        (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
      );

      setAnalyses(analysesData);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      setError("Failed to load analyses");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user, fetchAnalyses]);

  if (loading) {
    return <PageLoader text="Loading analyses..." />;
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Analyses
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Review your saved text and file analyses.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
            <p>{error}</p>
          </div>
        )}

        {analyses.length === 0 && !loading && (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No analyses found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by analyzing some text or a file.
            </p>
            <div className="mt-6">
              <Link
                href="/analyze"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Analyze Now
              </Link>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {analyses.map((analysis) => (
            <Link key={analysis.id} href={`/analyses/${analysis.id}`}>
              <div className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 sm:p-6 h-full flex flex-col justify-between group">
                <div className="flex-1">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {analysis.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Analyzed on{" "}
                    {analysis.createdAt.toDate().toLocaleDateString()}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400 mb-1">
                      Total Words
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {analysis.summary.totalWords.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400 mb-1">
                      Unique Words
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {analysis.summary.uniqueWords.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400 mb-1">
                      Known Words
                    </span>
                    <span className="font-semibold text-green-600">
                      {analysis.summary.knownWords.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400 mb-1">
                      Unknown Words
                    </span>
                    <span className="font-semibold text-red-600">
                      {analysis.summary.unknownWords.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

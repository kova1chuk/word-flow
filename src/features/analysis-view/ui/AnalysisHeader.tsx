import React from "react";

import Link from "next/link";

import { Analysis, SerializableTimestamp } from "@/entities/analysis/types";

interface AnalysisHeaderProps {
  analysis: Analysis | null;
}

// Helper function to convert SerializableTimestamp to string
const formatTimestamp = (timestamp: SerializableTimestamp | string): string => {
  if (typeof timestamp === "string") {
    return timestamp;
  }

  // Use the dateString property from SerializableTimestamp
  return timestamp.dateString;
};

export function AnalysisHeader({ analysis }: AnalysisHeaderProps) {
  if (!analysis) {
    return (
      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="mb-2 h-6 w-1/3 rounded bg-gray-300"></div>
          <div className="h-4 w-1/2 rounded bg-gray-300"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/analyses"
          className="inline-flex items-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Analyses
        </Link>
      </div>

      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        {analysis.title || "Analysis"}
      </h1>

      {analysis.summary && (
        <p className="text-lg text-gray-600">
          {analysis.summary.totalWords} total words,{" "}
          {analysis.summary.uniqueWords} unique words
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
        <span>
          Created:{" "}
          {new Date(formatTimestamp(analysis.createdAt)).toLocaleDateString()}
        </span>
        {analysis.summary?.totalWords && (
          <span>Words: {analysis.summary.totalWords}</span>
        )}
        {analysis.sentencesCount && (
          <span>Sentences: {analysis.sentencesCount}</span>
        )}
      </div>
    </div>
  );
}

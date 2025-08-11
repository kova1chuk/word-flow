"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useSelector } from "react-redux";

import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

import { useAnalyses } from "@review";

import { selectUser } from "@/entities/user/model/selectors";

export default function TrainingPage() {
  const user = useSelector(selectUser);

  // URL state management
  const router = useRouter();
  const searchParams = useSearchParams();

  // Analyses selection
  const { analyses } = useAnalyses();
  const [analysesExpanded, setAnalysesExpanded] = useState(false);
  const [selectedAnalysisIds, setSelectedAnalysisIds] = useState<string[]>([]);

  // Load selected analyses from URL on component mount
  useEffect(() => {
    const analysesParam = searchParams.get("analyses");
    if (analysesParam) {
      const analysisIds = analysesParam
        .split(",")
        .filter((id) => id.trim() !== "");
      setSelectedAnalysisIds(analysisIds);
      // Auto-expand analyses section if analyses are selected
      if (analysisIds.length > 0) {
        setAnalysesExpanded(true);
      }
    }
  }, [searchParams]);

  // Update URL when selected analyses change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedAnalysisIds.length > 0) {
      params.set("analyses", selectedAnalysisIds.join(","));
    } else {
      params.delete("analyses");
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [selectedAnalysisIds, router, searchParams]);

  const toggleAnalysis = (id: string) => {
    setSelectedAnalysisIds((prev) =>
      prev.includes(id)
        ? prev.filter((analysisId) => analysisId !== id)
        : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedAnalysisIds.length === analyses.length) {
      setSelectedAnalysisIds([]);
    } else {
      setSelectedAnalysisIds(analyses.map((a) => a.id));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl p-4">
          <div className="py-8 text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Please sign in to access training
            </h1>
            <Link
              href="/signin"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Training
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Choose your training type and start learning
          </p>
        </div>

        {/* Training Types */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/training/audio_dictation"
            className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
          >
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Audio Dictation
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Listen to audio and type the word you hear
            </p>
          </Link>

          <Link
            href="/training/choose_translation"
            className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
          >
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Choose Translation
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose the correct translation for each word
            </p>
          </Link>

          <Link
            href="/training/context_usage"
            className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
          >
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Context Usage
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Use words in context to improve understanding
            </p>
          </Link>

          <Link
            href="/training/input_word"
            className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
          >
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Input Word
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Type words based on definitions or translations
            </p>
          </Link>

          <Link
            href="/training/synonym_match"
            className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
          >
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Synonym Match
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Match words with their synonyms
            </p>
          </Link>

          <Link
            href="/training/manual"
            className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
          >
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Manual Training
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Manual word review and practice
            </p>
          </Link>
        </div>

        {/* Analyses Selection */}
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Select Analyses (Optional)
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Choose specific analyses to focus your training on
          </p>

          <button
            onClick={() => setAnalysesExpanded(!analysesExpanded)}
            className="mb-3 flex items-center text-lg font-medium text-gray-900 dark:text-white"
          >
            {analysesExpanded ? (
              <ChevronDownIcon className="mr-2 h-5 w-5" />
            ) : (
              <ChevronRightIcon className="mr-2 h-5 w-5" />
            )}
            Analyses ({selectedAnalysisIds.length} selected)
          </button>

          {analysesExpanded && (
            <div className="ml-7 space-y-2">
              <div className="mb-2 flex items-center gap-2">
                <button
                  onClick={toggleAll}
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  {selectedAnalysisIds.length === analyses.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
              {analyses.map((analysis) => (
                <label
                  key={analysis.id}
                  className="flex cursor-pointer items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedAnalysisIds.includes(analysis.id)}
                    onChange={() => toggleAnalysis(analysis.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {analysis.title}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { selectUser } from "@/entities/user/model/selectors";
import { useAnalyses } from "@/features/analyses/lib/useAnalyses";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useUserStatsRTK } from "@/shared/hooks/useUserStatsRTK";
import { useAnalysisFilteredStats } from "@/shared/hooks/useAnalysisFilteredStats";
import Link from "next/link";

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
    router.replace(newUrl, { scroll: false });
  }, [selectedAnalysisIds, router, searchParams]);

  const { wordStats: userWordStats } = useUserStatsRTK();
  const { filteredWordStats } = useAnalysisFilteredStats(selectedAnalysisIds);

  const TRAINING_TYPE_OPTIONS = [
    {
      value: "input_word",
      label: "Input Word",
      description: "Type the English word based on translation",
      icon: "⌨️",
      path: "/training/input_word",
    },
    {
      value: "choose_translation",
      label: "Choose Translation",
      description: "Select correct translation from options",
      icon: "✅",
      path: "/training/choose_translation",
    },
    {
      value: "context_usage",
      label: "Context Usage",
      description: "Complete sentences with correct words",
      icon: "📝",
      path: "/training/context_usage",
    },
    {
      value: "synonym_match",
      label: "Synonym Match",
      description: "Find synonyms and antonyms",
      icon: "🔗",
      path: "/training/synonym_match",
    },
    {
      value: "audio_dictation",
      label: "Audio Dictation",
      description: "Listen and type what you hear",
      icon: "🎧",
      path: "/training/audio_dictation",
    },
    {
      value: "manual",
      label: "Manual Review",
      description: "Review words and update status",
      icon: "📋",
      path: "/training/manual",
    },
  ];

  const toggleAnalysis = (id: string) => {
    setSelectedAnalysisIds((prev) =>
      prev.includes(id)
        ? prev.filter((analysisId) => analysisId !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedAnalysisIds.length === analyses.length) {
      setSelectedAnalysisIds([]);
    } else {
      setSelectedAnalysisIds(analyses.map((a) => a.id));
    }
  };

  const getTotalWords = () => {
    if (!userWordStats) return 0;
    let total = 0;
    Object.values(userWordStats).forEach((count) => {
      total += count;
    });
    return total;
  };

  const getFilteredTotalWords = () => {
    if (!filteredWordStats) return 0;
    let total = 0;
    Object.values(filteredWordStats).forEach((count) => {
      total += count;
    });
    return total;
  };

  if (!user) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to access training
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Training Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose your training type and start learning
          </p>
        </div>

        {/* Stats Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Learning Stats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getTotalWords()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Words
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {selectedAnalysisIds.length > 0
                  ? getFilteredTotalWords()
                  : getTotalWords()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Available for Training
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {analyses.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Analyses
              </div>
            </div>
          </div>
        </div>

        {/* Analyses Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Select Analyses (Optional)
            </h2>
            <button
              onClick={() => setAnalysesExpanded(!analysesExpanded)}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {analysesExpanded ? (
                <ChevronDownIcon className="h-5 w-5" />
              ) : (
                <ChevronRightIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {analysesExpanded && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleAll}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {selectedAnalysisIds.length === analyses.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedAnalysisIds.length} of {analyses.length} selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {analyses.map((analysis) => (
                  <button
                    key={analysis.id}
                    onClick={() => toggleAnalysis(analysis.id)}
                    className={`p-3 text-left rounded-lg border-2 transition-colors ${
                      selectedAnalysisIds.includes(analysis.id)
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {analysis.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {analysis.summary?.totalWords ?? 0} words
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Training Types Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Choose Training Type
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRAINING_TYPE_OPTIONS.map((option) => {
              const url = new URL(option.path, window.location.origin);
              if (selectedAnalysisIds.length > 0) {
                url.searchParams.set("analyses", selectedAnalysisIds.join(","));
              }

              return (
                <Link
                  key={option.value}
                  href={url.toString()}
                  className="group block p-6 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                      {option.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {option.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                    <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium">
                      Start Training →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

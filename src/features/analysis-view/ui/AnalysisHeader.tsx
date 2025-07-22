import React, { useState } from "react";

import { useSelector } from "react-redux";

import { selectUser } from "@/entities/user/model/selectors";

import { supabase } from "@/lib/supabaseClient";

interface AnalysisHeaderProps {
  analysis: {
    id: string;
    title: string;
    summary?: {
      totalWords: number;
      uniqueWords: number;
      learnerWords: number;
      unknownWords: number;
    };
  } | null;
  onTitleUpdate?: (newTitle: string) => void;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  analysis,
  onTitleUpdate,
}) => {
  const user = useSelector(selectUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(analysis?.title || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveTitle = async () => {
    if (!analysis || !user) return;

    setIsUpdating(true);
    try {
      // TODO: Implement Supabase title update
      console.log("Would update analysis title:", {
        analysisId: analysis.id,
        newTitle: editedTitle,
        userId: user.uid,
      });

      onTitleUpdate?.(editedTitle);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating title:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedTitle(analysis?.title || "");
    setIsEditing(false);
  };

  if (!analysis) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-200 dark:bg-gray-700 rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          {isEditing ? (
            <div className="flex items-center space-x-3 flex-1">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-1 text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 text-gray-900 dark:text-white"
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                disabled={isUpdating}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {analysis.title}
              </h1>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Edit title"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {analysis.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analysis.summary.totalWords}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Total Words
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {analysis.summary.uniqueWords}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Unique Words
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {analysis.summary.learnerWords}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">
                Learning
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {analysis.summary.unknownWords}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                Unknown
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import { useState } from "react";

import { AnalysisResult } from "../lib/analyzeApi";

interface AnalysisResultsProps {
  analysisResult: AnalysisResult;
  onSave: () => void;
  saving: boolean;
  onTitleChange?: (newTitle: string) => void;
  isSaved?: boolean;
  analysisId?: string | null;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysisResult,
  onSave,
  saving,
  onTitleChange,
  isSaved = false,
  analysisId,
}) => {
  const { summary, isProcessingUserWords } = analysisResult;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(analysisResult.title);

  const handleTitleSave = () => {
    if (onTitleChange && title.trim() !== analysisResult.title) {
      onTitleChange(title.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setTitle(analysisResult.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center flex-1">
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyPress}
              className="text-xl font-semibold text-gray-900 dark:text-white bg-transparent border-b border-blue-500 focus:outline-none focus:border-blue-600 w-full"
              autoFocus
            />
          ) : (
            <h2
              className={`text-xl font-semibold text-gray-900 dark:text-white transition-colors ${
                isSaved
                  ? ""
                  : "cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
              }`}
              onClick={() => !isSaved && setIsEditingTitle(true)}
            >
              {title}
            </h2>
          )}
          {!isEditingTitle && !isSaved && (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="ml-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary.totalWords.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Words
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary.uniqueWords.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Unique Words
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          {isProcessingUserWords ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-blue-600 dark:text-blue-400 text-sm">
                Processing learned words...
              </span>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summary.learnerWords.toLocaleString()}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Learner Words
              </div>
            </>
          )}
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 col-span-1 md:col-span-2 lg:col-span-3">
          {isProcessingUserWords ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              <span className="ml-2 text-red-600 dark:text-red-400 text-sm">
                Processing unknown words...
              </span>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {summary.unknownWords.toLocaleString()}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                Unknown Words
              </div>
            </>
          )}
        </div>
      </div>

      {!isProcessingUserWords && !isSaved && (
        <div className="flex justify-between items-center">
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Analysis"}
          </button>
        </div>
      )}

      {isSaved && (
        <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Analysis saved successfully
          {analysisId && (
            <a
              href={`/analyses/${analysisId}`}
              className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              View analysis
            </a>
          )}
        </div>
      )}
    </div>
  );
};

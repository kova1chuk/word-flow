import { useState } from "react";

import { useAppSelector } from "../../../../../shared/model/store";
import { selectCreateReview } from "../../../model/createReviewModel/createReviewSelectors";

interface AnalysisResultsProps {
  onSave: () => void;
  saving: boolean;
  onTitleChange?: (newTitle: string) => void;
  isSaved?: boolean;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  onSave,
  saving,
  onTitleChange,
  isSaved = false,
}) => {
  const parsedReview = useAppSelector(selectCreateReview);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(parsedReview.title);

  const handleTitleSave = () => {
    if (onTitleChange && title.trim() !== parsedReview.title) {
      onTitleChange(title.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setTitle(parsedReview.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="mt-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <div className="mb-6 flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
        <div className="flex flex-1 items-center">
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyPress}
              className="w-full border-b border-blue-500 bg-transparent text-xl font-semibold text-gray-900 focus:border-blue-600 focus:outline-none dark:text-white"
              autoFocus
            />
          ) : (
            <h2
              className={`text-xl font-semibold text-gray-900 transition-colors dark:text-white ${
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
              className="ml-3 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
            >
              <svg
                className="h-4 w-4"
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

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {parsedReview.totalWords.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Words
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {parsedReview.totalUniqueWords.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Unique Words
          </div>
        </div>
      </div>

      {parsedReview.parsed && !parsedReview.processing && (
        <div className="flex items-center justify-between">
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-md bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-600"
          >
            {saving ? "Saving..." : "Save Analysis"}
          </button>
        </div>
      )}
    </div>
  );
};

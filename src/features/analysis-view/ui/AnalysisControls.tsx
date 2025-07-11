interface AnalysisControlsProps {
  sentencesLength: number;
  currentPage: number;
  totalPages: number;
  viewMode: "list" | "columns";
  isFullScreen: boolean;
  onViewModeChange: (mode: "list" | "columns") => void;
  onFullScreenToggle: () => void;
  onSettingsToggle: () => void;
}

export const AnalysisControls: React.FC<AnalysisControlsProps> = ({
  viewMode,
  isFullScreen,
  sentencesLength,
  onViewModeChange,
  onFullScreenToggle,
  onSettingsToggle,
  currentPage,
  totalPages,
}) => {
  // Helper function to format numbers consistently
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Left side - Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sentences ({formatNumber(sentencesLength)})
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Page</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {currentPage} of {totalPages}
          </span>
        </div>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-2">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange("list")}
            className={`px-3 py-2 text-sm rounded-md flex items-center justify-center transition-all duration-200 ${
              viewMode === "list"
                ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
            aria-label="List View"
            title="List View"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange("columns")}
            className={`px-3 py-2 text-sm rounded-md flex items-center justify-center transition-all duration-200 ${
              viewMode === "columns"
                ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
            aria-label="Columns View"
            title="Columns View"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="4" y="6" width="5" height="12" rx="1" />
              <rect x="15" y="6" width="5" height="12" rx="1" />
            </svg>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onFullScreenToggle}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200"
            aria-label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V6a2 2 0 012-2h2M20 8V6a2 2 0 00-2-2h-2M4 16v2a2 2 0 002 2h2M20 16v2a2 2 0 01-2 2h-2"
              />
            </svg>
          </button>

          <button
            onClick={onSettingsToggle}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 bg-white dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200"
            title="Reading Settings"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

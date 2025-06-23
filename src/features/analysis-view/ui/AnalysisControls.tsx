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
  sentencesLength,
  currentPage,
  totalPages,
  viewMode,
  isFullScreen,
  onViewModeChange,
  onFullScreenToggle,
  onSettingsToggle,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Sentences ({sentencesLength}) - Page {currentPage} of {totalPages}
      </h2>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onViewModeChange("list")}
          className={`px-3 py-1.5 text-sm rounded-md ${
            viewMode === "list"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          List
        </button>
        <button
          onClick={() => onViewModeChange("columns")}
          className={`px-3 py-1.5 text-sm rounded-md ${
            viewMode === "columns"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Columns
        </button>
        <button
          onClick={onFullScreenToggle}
          className="px-3 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
        >
          {isFullScreen ? "Exit Full Screen" : "Full Screen"}
        </button>
        <button
          onClick={onSettingsToggle}
          className="px-3 py-1.5 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700"
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
  );
};

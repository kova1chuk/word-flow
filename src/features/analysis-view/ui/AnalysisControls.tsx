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
          className={`px-3 py-1.5 text-sm rounded-md flex items-center justify-center ${
            viewMode === "list"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
          aria-label="List View"
          title="List View"
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <button
          onClick={() => onViewModeChange("columns")}
          className={`px-3 py-1.5 text-sm rounded-md flex items-center justify-center ${
            viewMode === "columns"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
          aria-label="Columns View"
          title="Columns View"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="4" y="6" width="5" height="12" rx="1" />
            <rect x="15" y="6" width="5" height="12" rx="1" />
          </svg>
        </button>
        <button
          onClick={onFullScreenToggle}
          className="px-3 py-1.5 text-sm rounded-md flex items-center justify-center bg-green-600 text-white hover:bg-green-700"
          aria-label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
          title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
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
              d="M4 8V6a2 2 0 012-2h2M20 8V6a2 2 0 00-2-2h-2M4 16v2a2 2 0 002 2h2M20 16v2a2 2 0 01-2 2h-2"
            />
          </svg>
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

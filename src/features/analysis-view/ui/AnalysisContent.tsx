import type { Sentence } from "@/entities/analysis/types";

import { AnalysisControls } from "./AnalysisControls";
import { Pagination } from "./Pagination";
import { SentenceList } from "./SentenceList";

interface AnalysisContentProps {
  sentences: Sentence[];
  currentSentences: Sentence[];
  currentPage: number;
  totalPages: number;
  viewMode: "list" | "columns";
  isFullScreen: boolean;
  translatedSentences: Record<string, string>;
  translatingSentenceId: string | null;
  onViewModeChange: (mode: "list" | "columns") => void;
  onFullScreenToggle: () => void;
  onSettingsToggle: () => void;
  onWordClick: () => void;
  onTranslate: (sentenceId: string, text: string) => void;
  onPageChange: (page: number) => void;
  sentencesLoading?: boolean;
}

export const AnalysisContent: React.FC<AnalysisContentProps> = ({
  sentences,
  currentSentences,
  currentPage,
  totalPages,
  viewMode,
  isFullScreen,
  translatedSentences,
  translatingSentenceId,
  onViewModeChange,
  onFullScreenToggle,
  onSettingsToggle,
  onWordClick,
  onTranslate,
  onPageChange,
  sentencesLoading = false,
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${
        isFullScreen ? "flex-1 flex flex-col" : ""
      }`}
    >
      {/* Controls Section */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <AnalysisControls
          sentencesLength={sentences.length}
          currentPage={currentPage}
          totalPages={totalPages}
          viewMode={viewMode}
          isFullScreen={isFullScreen}
          onViewModeChange={onViewModeChange}
          onFullScreenToggle={onFullScreenToggle}
          onSettingsToggle={onSettingsToggle}
        />
      </div>

      {/* Content Section */}
      <div className={`${isFullScreen ? "flex-1 flex flex-col" : ""}`}>
        <SentenceList
          sentences={currentSentences}
          viewMode={viewMode}
          isFullScreen={isFullScreen}
          translatedSentences={translatedSentences}
          translatingSentenceId={translatingSentenceId}
          onWordClick={onWordClick}
          onTranslate={onTranslate}
          loading={sentencesLoading}
        />
      </div>

      {/* Pagination Section */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

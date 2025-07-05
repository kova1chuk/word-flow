import { Sentence } from "@/entities/analysis";
import { AnalysisControls } from "./AnalysisControls";
import { SentenceList } from "./SentenceList";
import { Pagination } from "./Pagination";

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
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${
        isFullScreen ? "flex-1 flex flex-col" : ""
      }`}
    >
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

      <SentenceList
        sentences={currentSentences}
        viewMode={viewMode}
        isFullScreen={isFullScreen}
        translatedSentences={translatedSentences}
        translatingSentenceId={translatingSentenceId}
        onWordClick={onWordClick}
        onTranslate={onTranslate}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

import { Timestamp } from "firebase/firestore";

export interface Analysis {
  id: string;
  title: string;
  userId: string;
  createdAt: Timestamp;
  summary: {
    totalWords: number;
    uniqueWords: number;
    knownWords: number;
    unknownWords: number;
  };
}

export interface Sentence {
  id: string;
  text: string;
  index: number;
}

export interface WordInfo {
  word: string;
  definition?: string;
  translation?: string;
  details?: Record<string, unknown>;
}

export interface ReadingProgress {
  currentPage: number;
  currentSentenceIndex: number;
  lastReadAt: Timestamp;
}

export interface UserSettings {
  sentencesPerPage: number;
}

export interface AnalysisState {
  analysis: Analysis | null;
  sentences: Sentence[];
  loading: boolean;
  error: string | null;
  translatedSentences: Record<string, string>;
  translatingSentenceId: string | null;
  selectedWord: WordInfo | null;
  wordInfoLoading: boolean;
  reloadingDefinition: boolean;
  reloadingTranslation: boolean;
}

export interface AnalysisViewState {
  viewMode: "list" | "columns";
  isFullScreen: boolean;
  currentPage: number;
  sentencesPerPage: number;
  showSettings: boolean;
}

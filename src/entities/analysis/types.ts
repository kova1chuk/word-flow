// Serializable timestamp interface
export interface SerializableTimestamp {
  seconds: number;
  nanoseconds: number;
  dateString: string; // ISO string for serialization
}

export interface Analysis {
  id: string;
  title: string;
  userId: string;
  createdAt: SerializableTimestamp;
  summary: {
    totalWords: number;
    uniqueWords: number;
    knownWords: number;
    unknownWords: number;
    wordStats?: { [key: number]: number };
  };
  sentencesCount?: number; // Total number of sentences
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
  lastReadAt: SerializableTimestamp;
}

export interface UserSettings {
  sentencesPerPage: number;
}

export interface TrainingStats {
  learned: number;
  notLearned: number;
  total: number;
}

// Firestore document snapshot type
export interface FirestoreDocSnapshot {
  id: string;
  exists: () => boolean;
  data: () => Record<string, unknown>;
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
  // Pagination states
  sentencesLoading: boolean;
  hasMore: boolean;
  lastDoc: FirestoreDocSnapshot | null;
  // Training stats states
  trainingStats: TrainingStats | null;
  trainingLoading: boolean;
}

export interface AnalysisViewState {
  viewMode: "list" | "columns";
  isFullScreen: boolean;
  currentPage: number;
  sentencesPerPage: number;
  showSettings: boolean;
}

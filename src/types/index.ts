export type WordStatus = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Phonetic {
  text: string;
  audio: string;
}

export interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

export interface WordDetails {
  phonetics: Phonetic[];
  meanings: Meaning[];
}

export interface UserWord {
  id: string;
  wordId: string;
  userId: string;
  status: WordStatus;
  lastTrainedAt?: Date;
  trainHistory: TrainingResult[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingResult {
  id: string;
  result: "correct" | "incorrect";
  type: TrainingType;
  timestamp: Date;
  oldStatus: WordStatus;
  newStatus: WordStatus;
  sessionId?: string;
}

export type TrainingType =
  | "input_word" // Input the English Word
  | "choose_translation" // Choose the Correct Translation
  | "context_usage" // Usage in Context
  | "synonym_match" // Synonym/Antonym Match
  | "audio_dictation"
  | "manual"; // Manual word review and status management // Audio Dictation

export interface TrainingSession {
  id: string;
  userId: string;
  mode: "word" | "sentence";
  wordIds: string[];
  currentIndex: number;
  completedWords: string[];
  correctAnswers: number;
  incorrectAnswers: number;
  startedAt: Date;
  completedAt?: Date;
  settings: TrainingSettings;
}

export interface TrainingSettings {
  autoAdvance: boolean;
  showTranslation: boolean;
  showDefinition: boolean;
  trainingTypes: TrainingType[];
  sessionSize: number;
  priorityLowerStatus: boolean;
  priorityOldWords: boolean;
}

export interface UserStats {
  id: string;
  userId: string;
  wordStats: Record<number, number>; // status -> count
  lastSessionAt?: Date;
  totalSessions: number;
  accuracyPerType?: Record<TrainingType, number>;
  favoriteWords?: string[];
  streakDays: number;
  totalWordsTrained: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingQuestion {
  id: string;
  wordId: string;
  type: TrainingType;
  question: string;
  correctAnswer: string;
  options?: string[]; // For multiple choice questions
  context?: string; // For context usage questions
  audioUrl?: string; // For audio dictation
}

import type { Timestamp } from "firebase/firestore";

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

export interface Word {
  id: string;
  word: string;
  translation?: string;
  definition?: string;
  examples?: string[];
  audioUrl?: string;
  synonyms?: string[];
  antonyms?: string[];
  analyses?: Record<string, { count: number }>;
  definedAt?: Date;
  translatedAt?: Date;
  source?: string;
  status?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  createdAt: Timestamp;
  details?: WordDetails;
  isLearned?: boolean;
  isInDictionary?: boolean;
  usages?: string[];
  analysisIds?: string[];
  userId?: string;
}

export interface UserWord {
  id: string;
  wordId: string;
  userId: string;
  status: 1 | 2 | 3 | 4 | 5 | 6 | 7;
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
  oldStatus: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  newStatus: 1 | 2 | 3 | 4 | 5 | 6 | 7;
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

import { WordStatus } from "@/types";

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
  definition?: string;
  translation?: string;
  example?: string;
  status: WordStatus;
  phonetic: Phonetic;
  userId: string;
  createdAt: string;
  updatedAt: string;
  details?: WordDetails;
  isLearned?: boolean;
  isInDictionary?: boolean;
  usages?: string[];
  analysisIds?: string[];
  lastTrainedAt?: string;
}

export interface WordState {
  words: Word[];
  loading: boolean;
  error: string | null;
  selectedWord: Word | null;
}

export interface CreateWordRequest {
  word: string;
  definition?: string;
  example?: string;
}

export interface UpdateWordRequest {
  id: string;
  definition?: string;
  translation?: string;
  status?: string;
  details?: WordDetails;
}

// Status constants for easy reference
export const WORD_STATUS = {
  NOT_LEARNED: 1,
  BEGINNER: 2,
  BASIC: 3,
  INTERMEDIATE: 4,
  ADVANCED: 5,
  WELL_KNOWN: 6,
  MASTERED: 7,
} as const;

export const WORD_STATUS_LABELS = {
  1: "Not Learned",
  2: "Beginner",
  3: "Basic",
  4: "Intermediate",
  5: "Advanced",
  6: "Well Known",
  7: "Mastered",
} as const;

export const WORD_STATUS_COLORS = {
  1: "bg-gray-500 text-white border-gray-500",
  2: "bg-red-500 text-white border-red-500",
  3: "bg-orange-500 text-white border-orange-500",
  4: "bg-yellow-500 text-white border-yellow-500",
  5: "bg-blue-500 text-white border-blue-500",
  6: "bg-green-500 text-white border-green-500",
  7: "bg-purple-500 text-white border-purple-500",
} as const;

// Helper functions
export const isWordLearned = (status?: number): boolean => {
  return status ? status >= 6 : false;
};

export const getStatusLabel = (status?: number): string => {
  return status
    ? WORD_STATUS_LABELS[status as keyof typeof WORD_STATUS_LABELS] || "Unknown"
    : "No Status";
};

export const getStatusColor = (status?: number): string => {
  return status
    ? WORD_STATUS_COLORS[status as keyof typeof WORD_STATUS_COLORS] ||
        "bg-gray-500 text-white border-gray-500"
    : "bg-gray-500 text-white border-gray-500";
};

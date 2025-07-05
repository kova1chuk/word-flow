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
  definition: string;
  translation?: string;
  status?: 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1 = not learned, 7 = very well learned
  createdAt: Timestamp;
  example?: string;
  details?: WordDetails;
  isLearned?: boolean; // For backward compatibility
  isInDictionary?: boolean; // For backward compatibility
  usages?: string[];
  analysisIds?: string[];
}

import { BaseEntity } from "@/shared/types";

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

export interface Word extends BaseEntity {
  userId: string;
  word: string;
  definition?: string;
  translation?: string;
  example?: string;
  status?: "well_known" | "want_repeat" | "to_learn" | "unset";
  details?: WordDetails;
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

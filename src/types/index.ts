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
  status?: string;
  createdAt: Timestamp;
  example?: string;
  details?: WordDetails;
}

import type { Word } from "@/entities/word/types";

export type GetDictStatsResponse = Record<string, number>;

export interface UserDictionaryStatsResponse {
  totalWords: number;
  wordStats: Record<string, number>;
}

export interface FetchWordsPageResponse {
  words: Word[];
  totalWords: number;
  page: number;
  hasMore: boolean;
}

export interface FetchWordsPageParams {
  page: number;
  pageSize: number;
  statusFilter?: number[];
  search?: string;
  langCode?: string;
  translationLang?: string;
  analysesIds?: string[];
}

export interface DictionaryWordRow {
  word_id: string;
  text: string;
  definition: string;
  synonymous: string;
  antonyms: string;
  phonetic_text: string;
  phonetic_audio_link: string;
  status: string;
  total_count: number;
  in_analyses: boolean;
  translation: string;
  translation_definition: string;
}

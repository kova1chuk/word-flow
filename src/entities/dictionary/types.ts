export interface DictionaryWord {
  id: string;
  word: string;
  definition?: string;
  translation?: string;
  phonetic?: {
    text?: string;
    audio?: string;
  };
  partOfSpeech?: string;
  examples?: string[];
  synonyms?: string[];
  antonyms?: string[];
  meanings?: DictionaryMeaning[];
  source: DictionarySource;
  langCode: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: number; // Word learning status (1-7)
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface DictionaryApiResponse {
  word: string;
  phonetics: Array<{
    text?: string;
    audio?: string;
    sourceUrl?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }>;
    synonyms?: string[];
    antonyms?: string[];
  }>;
  license?: {
    name: string;
    url: string;
  };
  sourceUrls?: string[];
}

export interface OxfordApiResponse {
  id: string;
  metadata: {
    operation: string;
    provider: string;
    schema: string;
  };
  results: Array<{
    id: string;
    language: string;
    lexicalEntries: Array<{
      entries: Array<{
        pronunciations?: Array<{
          audioFile?: string;
          dialects?: string[];
          phoneticNotation?: string;
          phoneticSpelling?: string;
        }>;
        senses?: Array<{
          definitions?: string[];
          examples?: Array<{
            text: string;
          }>;
          synonyms?: Array<{
            language: string;
            text: string;
          }>;
        }>;
      }>;
      language: string;
      lexicalCategory: {
        id: string;
        text: string;
      };
      text: string;
    }>;
    type: string;
    word: string;
  }>;
  word: string;
}

export interface TranslationResponse {
  responseData: {
    translatedText: string;
    match: number;
  };
  quotaFinished: boolean;
  mtLangSupported: string | null;
  responseDetails: string;
  responseStatus: number;
  responderId: string | null;
  exception_code: string | null;
  matches: Array<{
    id: string;
    segment: string;
    translation: string;
    source: string;
    target: string;
    quality: string;
    reference: string | null;
    "usage-count": number;
    subject: string;
    "created-by": string;
    "last-updated-by": string;
    "create-date": string;
    "last-update-date": string;
    match: number;
  }>;
}

export type DictionarySource =
  | "dictionaryapi"
  | "oxford"
  | "mymemory"
  | "supabase";

export interface DictionaryState {
  words: Record<string, DictionaryWord>;
  loading: boolean;
  error: string | null;
  lookupHistory: string[];
  cache: {
    definitions: Record<string, DictionaryWord>;
    translations: Record<string, string>;
  };
}

export interface LookupWordArgs {
  word: string;
  langCode?: string;
  source?: DictionarySource;
  forceRefresh?: boolean;
}

export interface TranslateWordArgs {
  word: string;
  sourceLang?: string;
  targetLang?: string;
  forceRefresh?: boolean;
}

export interface SaveWordArgs {
  word: DictionaryWord;
  userId: string;
}

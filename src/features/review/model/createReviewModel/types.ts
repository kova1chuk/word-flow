import { WordStatus } from "../../../../types";

export interface CreateReviewState {
  parsed: boolean;
  processing: boolean;
  saving: boolean;
  saved: boolean;
  title: string;
  sentences: string[];
  words: { text: string; usageCount: number }[];
  totalWords: number;
  totalUniqueWords: number;
  totalSentences: number;
  wordsStats: {
    [key in WordStatus]: number;
  };
  unknownWordsCount: number;
}

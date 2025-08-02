export interface ReviewDataParsedResponse {
  title?: string;
  words: [string, number][]; // [word, usage_count]
  sentences: string[];
  total_words: number;
  total_unique_words: number;
  total_sentences: number;
}

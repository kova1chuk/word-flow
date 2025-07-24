import { createClient } from "@/utils/supabase/client";

export interface AnalysisResult {
  title: string;
  wordFrequency: { [key: string]: number };
  unknownWordList: string[];
  sentences: string[];
  summary: {
    totalWords: number;
    uniqueWords: number;
    learnerWords: number;
    unknownWords: number;
  };
  isProcessingUserWords?: boolean;
}

export interface ApiAnalysisResponse {
  title?: string;
  wordFrequency?: { [key: string]: number };
  unknownWordList?: string[];
  sentences?: string[];
  totalWords?: number;
  uniqueWords?: number;
  knownWords?: number;
  unknownWords?: number;
  averageWordLength?: number;
  readingTime?: number;
  summary?: {
    totalWords: number;
    uniqueWords: number;
    knownWords: number;
    unknownWords: number;
    averageWordLength: number;
    readingTime: number;
  };
  unique_words?: string[];
  total_words?: number;
  total_unique_words?: number;
}

type UserWord = {
  word: string;
  status?: string;
};

export type { UserWord };

const transformApiResult = (
  apiResponse: ApiAnalysisResponse,
  fileName: string,
): AnalysisResult => {
  const title = apiResponse.title || fileName || "Untitled Analysis";

  // Handle different response formats from the API
  let wordFrequency: { [key: string]: number } = {};
  let sentences: string[] = [];
  let totalWords = 0;
  let uniqueWords = 0;
  let unknownWords = 0;

  if (apiResponse.wordFrequency) {
    wordFrequency = apiResponse.wordFrequency;
    totalWords = Object.values(wordFrequency).reduce(
      (sum, count) => sum + count,
      0,
    );
    uniqueWords = Object.keys(wordFrequency).length;
  }

  if (apiResponse.sentences) {
    sentences = apiResponse.sentences;
  }

  if (apiResponse.summary) {
    totalWords = apiResponse.summary.totalWords || totalWords;
    uniqueWords = apiResponse.summary.uniqueWords || uniqueWords;
    unknownWords = apiResponse.summary.unknownWords || unknownWords;
  } else {
    // Calculate from individual fields if summary doesn't exist
    totalWords =
      apiResponse.totalWords || apiResponse.total_words || totalWords;
    uniqueWords =
      apiResponse.uniqueWords || apiResponse.total_unique_words || uniqueWords;
    unknownWords = apiResponse.unknownWords || 0;
  }

  return {
    title,
    wordFrequency,
    unknownWordList: apiResponse.unknownWordList || [],
    sentences,
    summary: {
      totalWords,
      uniqueWords,
      learnerWords: uniqueWords - unknownWords,
      unknownWords,
    },
  };
};

export { transformApiResult };

export const analyzeApi = {
  // Save analysis result using Supabase RPC
  async saveAnalysisSupabase(
    userId: string,
    analysisResult: AnalysisResult,
    langCode: string = "en",
  ): Promise<string> {
    const supabase = createClient();
    // Transform word frequency data to match the function signature
    const wordEntries = Object.entries(analysisResult.wordFrequency).map(
      ([text, usage_count]) => ({
        text,
        usage_count,
      }),
    );

    console.log("📤 Sending to Supabase:", {
      lang_code: langCode,
      user_id: userId,
      title: analysisResult.title,
      word_entries: wordEntries,
      external_sentences: analysisResult.sentences,
      document_link: null,
    });

    const { data, error } = await supabase.rpc("add_analysis_data", {
      lang_code: langCode,
      user_id: userId,
      title: analysisResult.title,
      word_entries: wordEntries,
      sentences: analysisResult.sentences,
      document_link: null,
    });

    if (error) {
      console.error("❌ Failed to save analysis:", error);
      throw error;
    }

    console.log("✅ Analysis saved successfully");
    return data; // Returns the analysis UUID
  },
};

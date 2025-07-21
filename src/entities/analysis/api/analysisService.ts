import { supabase } from "@/lib/supabaseClient";

interface SerializableTimestamp {
  seconds: number;
  nanoseconds: number;
  dateString: string;
}

interface Analysis {
  id: string;
  title: string;
  userId: string;
  createdAt: SerializableTimestamp;
  summary: {
    totalWords: number;
    uniqueWords: number;
    knownWords: number;
    unknownWords: number;
    wordStats?: { [key: number]: number };
  };
  sentencesCount?: number;
}

interface Sentence {
  id: string;
  text: string;
  index: number;
}

export const fetchAnalysisDetails = async (
  analysisId: string,
  userId: string
): Promise<{
  analysis: Analysis;
  sentences: Sentence[];
}> => {
  const { data, error } = await supabase.rpc("get_analysis_by_id", {
    p_analysis_id: analysisId,
    p_user_id: userId,
  });

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("Analysis not found");
  }

  const analysisRow = data;
  const analysis: Analysis = {
    id: analysisRow.id,
    title: analysisRow.title,
    userId: userId,
    createdAt: {
      seconds: Math.floor(new Date(analysisRow.created_at).getTime() / 1000),
      nanoseconds: 0,
      dateString: analysisRow.created_at,
    },
    summary: {
      totalWords: analysisRow.total_words_count || 0,
      uniqueWords: analysisRow.unique_words_count || 0,
      knownWords: 0,
      unknownWords: 0,
      wordStats: analysisRow.words_stat || {},
    },
    sentencesCount: analysisRow.sentences_count || 0,
  };

  return { analysis, sentences: [] };
};

export const fetchSentencesPage = async (
  analysisId: string,
  page: number,
  pageSize: number,
  userId?: string
): Promise<{
  sentences: Sentence[];
  hasMore: boolean;
}> => {
  const { data, error } = await supabase.rpc("get_analysis_sentences", {
    p_analysis_id: analysisId,
    p_user_id: userId,
    p_limit: pageSize,
    p_offset: (page - 1) * pageSize,
  });

  if (error) {
    throw error;
  }

  const sentences: Sentence[] = (data || []).map(
    (row: { id: string; text: string; index: number }) => ({
      id: row.id,
      text: row.text,
      index: row.index,
    })
  );

  const hasMore = sentences.length === pageSize;

  return {
    sentences,
    hasMore,
  };
};

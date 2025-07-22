import { supabase } from "@/lib/supabaseClient";

export interface Analysis {
  id: string;
  title: string;
  createdAt: string;
  userId: string;
  totalWords: number;
  uniqueWords: number;
  wordsStat: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, number>;
}
export interface AnalysisSupabaseRow {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  total_words: number;
  unique_words: number;
  words_stat: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, number>;
}

export interface AnalysesApiResponse {
  analyses: AnalysisSupabaseRow[];
  hasMore: boolean;
  total: number;
}

// Fetch analyses using Supabase RPC
export async function fetchAnalysesSupabase(
  userId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  analyses: Analysis[];
  hasMore: boolean;
  total: number;
}> {
  try {
    const p_limit = pageSize;
    const p_offset = (page - 1) * pageSize;
    const p_user_id = userId;

    const { data, error } = await supabase.rpc("get_analyses", {
      p_limit,
      p_offset,
      p_user_id,
    });

    if (error) {
      console.error("Supabase RPC 'get_analyses' error:", error);
      // Return empty result for now
      return {
        analyses: [],
        hasMore: false,
        total: 0,
      };
    }

    const analyses: Analysis[] = (data || []).map(
      (row: AnalysisSupabaseRow) => ({
        id: row.id,
        title: row.title || "Untitled Analysis",
        createdAt: row.created_at,
        userId: row.user_id,
        totalWords: row.total_words || 0,
        uniqueWords: row.unique_words || 0,
        wordsStat: row.words_stat || {},
      })
    );

    const hasMore = analyses.length === pageSize;

    return {
      analyses,
      hasMore,
      total: analyses.length, // This would need a separate count query for exact total
    };
  } catch (error) {
    console.error("Error fetching analyses from Supabase:", error);
    // Return empty result instead of throwing
    return {
      analyses: [],
      hasMore: false,
      total: 0,
    };
  }
}

// Update analysis title using Supabase
export async function updateAnalysisTitleSupabase(
  analysisId: string,
  newTitle: string,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from("analyses")
      .update({ title: newTitle })
      .eq("id", analysisId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error updating analysis title:", error);
    throw error;
  }
}

// Delete analysis using Supabase
export async function deleteAnalysisSupabase(
  analysisId: string,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from("analyses")
      .delete()
      .eq("id", analysisId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting analysis:", error);
    throw error;
  }
}

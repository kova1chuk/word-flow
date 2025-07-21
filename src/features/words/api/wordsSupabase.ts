import type { Word } from "@/entities/word/types";

import { supabase } from "@/lib/supabaseClient";

export async function fetchWordsPageSupabase({
  userId,
  page,
  pageSize,
  statusFilter = [],
  search = "",
  analysisIds = [],
}: {
  userId: string;
  page: number;
  pageSize: number;
  statusFilter?: number[];
  search?: string;
  analysisIds?: string[];
}) {
  let query = supabase
    .from("words")
    .select("*", { count: "exact" })
    .eq("user_id", userId);

  if (statusFilter.length > 0) query = query.in("status", statusFilter);
  if (search) query = query.ilike("word", `%${search}%`);
  if (analysisIds.length > 0)
    query = query.overlaps("analysis_ids", analysisIds);

  query = query
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    words: data as Word[],
    totalWords: count ?? 0,
    page,
    hasMore: page * pageSize < (count ?? 0),
  };
}

export async function createWordSupabase(word: Omit<Word, "id">) {
  const { data, error } = await supabase
    .from("words")
    .insert([word])
    .select()
    .single();
  if (error) throw error;
  return data as Word;
}

export async function updateWordSupabase(id: string, updates: Partial<Word>) {
  const { data, error } = await supabase
    .from("words")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Word;
}

export async function deleteWordSupabase(id: string) {
  const { error } = await supabase.from("words").delete().eq("id", id);
  if (error) throw error;
  return true;
}

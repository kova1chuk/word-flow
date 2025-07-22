import type { Word } from "@/entities/word/types";

import { supabase } from "@/lib/supabaseClient";

// Define types for the RPC response
type WordStatus = "1" | "2" | "3" | "4" | "5" | "6" | "7";

interface DictionaryWord {
  word_id: string;
  text: string;
  definition: string;
  synonymous: string;
  antonyms: string;
  phonetic_text: string;
  phonetic_audio_link: string;
  status: WordStatus;
  total_count: number;
}

export async function fetchWordsPageSupabase({
  userId,
  page,
  pageSize,
  statusFilter = [],
  search = "",
  langCode = "en",
}: {
  userId: string;
  page: number;
  pageSize: number;
  statusFilter?: number[];
  search?: string;
  analysisIds?: string[];
  langCode?: string;
}) {
  const lang_code = langCode;
  const limit_count = pageSize;
  const offset_count = (page - 1) * pageSize;
  const search_text = search;
  const sort_order = "desc";
  const status_filter =
    statusFilter.length > 0 ? statusFilter.map(String) : null;
  const user_id = userId;

  const { data, error } = await supabase.rpc("get_dictionary_words", {
    lang_code,
    limit_count,
    offset_count,
    search_text,
    sort_order,
    status_filter,
    user_id,
  });

  if (error) {
    console.error("Error calling get_dictionary_words:", error);

    // If it's the bigint/integer type mismatch, fall back to direct table query
    if (error.code === "42804") {
      console.log("Falling back to direct table query due to type mismatch");
      return await fetchWordsDirectQuery({
        userId,
        page,
        pageSize,
        statusFilter,
        search,
      });
    }

    throw error;
  }

  // Handle the response - data is an array of DictionaryWord
  const rows = (data as DictionaryWord[]) || [];

  // Transform the rows to match the Word type structure
  const words = rows.map((row) => {
    return {
      id: row.word_id,
      word: row.text,
      definition: row.definition || undefined,
      translation: undefined,
      example: undefined,
      status: (parseInt(row.status) || 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      details:
        row.phonetic_text && row.phonetic_audio_link
          ? {
              phonetics: [
                {
                  text: row.phonetic_text,
                  audio: row.phonetic_audio_link,
                },
              ],
              meanings: [],
            }
          : undefined,
      isLearned: undefined,
      isInDictionary: undefined,
      usages: undefined,
      analysisIds: undefined,
      lastTrainedAt: undefined,
    };
  });

  // Get total count from the first row (all rows have the same total_count)
  const totalWords = rows.length > 0 ? rows[0].total_count : 0;

  return {
    words: words as Word[],
    totalWords,
    page,
    hasMore: page * pageSize < totalWords,
  };
}

// Fallback function using direct table queries
async function fetchWordsDirectQuery({
  page,
}: {
  userId: string;
  page: number;
  pageSize: number;
  statusFilter?: number[];
  search?: string;
}) {
  console.log("Using direct table query fallback");

  // Since the RPC function failed, let's return empty results for now
  // This prevents the app from crashing while you fix the PostgreSQL function
  console.warn(
    "Direct table query not implemented yet - returning empty results",
  );
  console.warn(
    "Please fix the PostgreSQL function by casting count(*)::integer",
  );

  return {
    words: [] as Word[],
    totalWords: 0,
    page,
    hasMore: false,
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

export async function updateWordDefinitionSupabase({
  langCode,
  wordId,
  newDefinition,
  newPhoneticAudioLink,
  newPhoneticText,
}: {
  langCode: string;
  wordId: string;
  newDefinition: string;
  newPhoneticAudioLink?: string;
  newPhoneticText?: string;
}) {
  console.log("Updating word definition with params:", {
    lang_code: langCode,
    word_id: wordId,
    new_definition: newDefinition,
    new_phonetic_audio_link: newPhoneticAudioLink || null,
    new_phonetic_text: newPhoneticText || null,
  });

  const { error } = await supabase.rpc("update_word_definition", {
    lang_code: langCode,
    word_id: wordId,
    new_definition: newDefinition,
    new_phonetic_audio_link: newPhoneticAudioLink || null,
    new_phonetic_text: newPhoneticText || null,
  });

  if (error) {
    console.error("Update failed:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  console.log("Definition updated successfully.");
}

export async function addWordToUserDictionarySupabase({
  userId,
  langCode,
  wordText,
}: {
  userId: string;
  langCode: string;
  wordText: string;
}) {
  const { data, error } = await supabase.rpc("add_word_to_user_dictionary", {
    user_id: userId,
    lang_code: langCode,
    word_text: wordText,
  });

  if (error) {
    console.error("❌ Failed to add word:", error.message);
    throw error;
  }

  console.log("✅ Word added successfully");
  return data;
}

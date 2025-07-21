import { supabase } from "@/lib/supabaseClient";

export type PublicUser = {
  id: string;
  created_at: string;
  native_language: string;
  learning_language: string;
};

export async function setUserLanguages(native: string, learning: string) {
  const { data, error } = await supabase.rpc("set_user_languages", {
    native,
    learning,
  });

  if (error) throw error;
  return data;
}

export async function getUserProfile(): Promise<PublicUser | null> {
  const { data, error } = await supabase.rpc("get_user");
  if (error) throw error;
  if (data && data.length > 0) {
    return data[0];
  }
  return null;
}

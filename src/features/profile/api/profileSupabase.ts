import { createClient } from "@/utils/supabase/client";

export type PublicUser = {
  id: string;
  created_at: string;
  native_language: string;
  learning_language: string;
};

export async function setUserLanguages(native: string, learning: string) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("set_user_languages", {
    native,
    learning,
  });

  if (error) throw error;
  return data;
}

export async function getUserProfile(): Promise<PublicUser | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_user");
  if (error) throw error;
  if (data && data.length > 0) {
    return data[0];
  }
  return null;
}

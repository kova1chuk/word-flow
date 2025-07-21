import { supabase } from "@/lib/supabaseClient";

import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface AuthError {
  code: string;
  message: string;
}

function mapSupabaseUser(user: SupabaseUser | null) {
  if (!user) return null;
  return {
    uid: user.id,
    email: user.email || "",
    displayName: user.user_metadata?.full_name || undefined,
    photoURL: user.user_metadata?.avatar_url || undefined,
    emailVerified: user.email_confirmed_at !== null,
    id: user.id,
    createdAt: user.created_at,
  };
}

export const authApi = {
  // Sign in with email and password
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user)
      throw {
        code: error?.code || "auth_error",
        message: error?.message || "Sign in failed",
      };
    return mapSupabaseUser(data.user);
  },

  // Sign up with email and password
  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user)
      throw {
        code: error?.code || "auth_error",
        message: error?.message || "Sign up failed",
      };
    return mapSupabaseUser(data.user);
  },

  // Sign in with Google
  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) throw { code: error.code, message: error.message };
    // For OAuth, user will be redirected, so no user object is returned here
    return null;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw { code: error.code, message: error.message };
  },

  // Validate password
  validatePassword(password: string): string | null {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  },

  // Validate password confirmation
  validatePasswordConfirmation(
    password: string,
    confirmPassword: string
  ): string | null {
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  },
};

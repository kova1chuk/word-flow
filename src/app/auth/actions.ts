"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/auth/signin?error=Invalid login credentials");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/auth/signup?error=Could not create account");
  }

  revalidatePath("/", "layout");
  redirect("/auth/signup?message=Check your email to confirm your account");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/signin");
}

export async function signInWithGoogle(origin?: string) {
  const supabase = await createClient();

  console.log("🔄 signInWithGoogle origin:", origin);

  // Get the base URL - prefer passed origin, then env vars, then Vercel URL
  const baseUrl =
    origin ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  console.log("🔄 signInWithGoogle baseUrl:", baseUrl);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/confirm`,
    },
  });

  if (error) {
    console.error("❌ Google OAuth error:", error);
    redirect("/auth/signin?error=Could not authenticate with Google");
  }

  if (data.url) {
    console.log("✅ Google OAuth initialized, redirecting to provider");
    redirect(data.url);
  }

  // Fallback redirect if no URL is provided
  redirect("/auth/signin?error=OAuth initialization failed");
}

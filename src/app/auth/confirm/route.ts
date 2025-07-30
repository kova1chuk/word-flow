import { type EmailOtpType } from "@supabase/supabase-js";
import { AuthApiError } from "@supabase/supabase-js";

import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  console.log("request", request);

  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  // Handle OAuth code exchange (Google, GitHub, etc.)
  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("❌ OAuth code exchange error:", error);

        if (
          error instanceof AuthApiError &&
          error.code === "refresh_token_not_found"
        ) {
          // Clear any existing session
          await supabase.auth.signOut();
          redirect(
            "/auth/signin?error=Authentication failed. Please try again.",
          );
        }

        redirect("/auth/signin?error=Authentication failed");
      }

      if (data.session) {
        console.log(
          "✅ OAuth authentication successful, redirecting to:",
          next,
        );
        redirect(next);
      }
    } catch (error) {
      // Re-throw redirect errors to let Next.js handle them
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        throw error;
      }

      console.error("OAuth exchange error:", error);
      redirect("/auth/signin?error=Authentication failed");
    }
  }

  // Handle OTP verification (email confirmation)
  if (token_hash && type) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });

      if (error) {
        console.error("❌ OTP verification error:", error);
        redirect("/auth/signin?error=Email verification failed");
      }

      console.log("✅ Email verification successful, redirecting to:", next);
      redirect(next);
    } catch (error) {
      // Re-throw redirect errors to let Next.js handle them
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        throw error;
      }

      console.error("OTP verification error:", error);
      redirect("/auth/signin?error=Email verification failed");
    }
  }

  // If neither code nor token_hash is present, redirect with error
  redirect("/auth/signin?error=Invalid authentication request");
}

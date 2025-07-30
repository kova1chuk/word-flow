import { createServerClient } from "@supabase/ssr";
import { AuthApiError } from "@supabase/supabase-js";

import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );

  // Wrap the auth methods to handle refresh token errors gracefully
  const originalGetUser = client.auth.getUser;
  client.auth.getUser = async () => {
    try {
      const result = await originalGetUser.call(client.auth);

      // Handle refresh token errors at the client level
      if (result.error && result.error instanceof AuthApiError) {
        if (
          result.error.code === "refresh_token_not_found" ||
          (result.error.status === 400 &&
            result.error.message.includes("Invalid Refresh Token"))
        ) {
          console.log("🔄 Server client: Suppressing refresh token error");
          return {
            data: { user: null },
            error: new AuthApiError("Session expired", 401, "session_expired"),
          };
        }
      }

      return result;
    } catch (error) {
      // Handle thrown refresh token errors
      if (
        error instanceof AuthApiError &&
        (error.code === "refresh_token_not_found" ||
          (error.status === 400 &&
            error.message.includes("Invalid Refresh Token")))
      ) {
        console.log(
          "🔄 Server client: Caught and suppressed refresh token error",
        );
        return {
          data: { user: null },
          error: new AuthApiError("Session expired", 401, "session_expired"),
        };
      }

      throw error;
    }
  };

  return client;
}

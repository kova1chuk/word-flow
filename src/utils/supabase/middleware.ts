import { createServerClient } from "@supabase/ssr";
import { AuthApiError } from "@supabase/supabase-js";

import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  try {
    const { error } = await supabase.auth.getUser();

    // Handle refresh token errors specifically
    if (error && error instanceof AuthApiError) {
      if (
        error.code === "refresh_token_not_found" ||
        (error.status === 400 &&
          error.message.includes("Invalid Refresh Token"))
      ) {
        console.log("🔄 Middleware: Clearing invalid refresh token cookies");

        // Clear all possible Supabase session cookies more aggressively
        const cookiesToClear = [
          "sb-access-token",
          "sb-refresh-token",
          "supabase-auth-token",
          "supabase.auth.token",
        ];

        // Clear specific cookies
        cookiesToClear.forEach((cookieName) => {
          supabaseResponse.cookies.set(cookieName, "", {
            path: "/",
            expires: new Date(0),
            maxAge: 0,
            httpOnly: true,
            secure: true,
            sameSite: "lax",
          });
        });

        // Clear all Supabase-related cookies based on patterns
        request.cookies.getAll().forEach((cookie) => {
          if (
            cookie.name.startsWith("sb-") ||
            cookie.name.includes("supabase") ||
            cookie.name.includes("auth-token")
          ) {
            supabaseResponse.cookies.set(cookie.name, "", {
              path: "/",
              expires: new Date(0),
              maxAge: 0,
              httpOnly: true,
              secure: true,
              sameSite: "lax",
            });
          }
        });

        console.log("🔄 Middleware: Invalid refresh token cookies cleared");
      }
    }
  } catch (error) {
    console.log("🔄 Middleware: Caught auth error, clearing cookies");

    // If it's an AuthApiError with refresh token issue, clear cookies
    if (
      error instanceof AuthApiError &&
      (error.code === "refresh_token_not_found" ||
        (error.status === 400 &&
          error.message.includes("Invalid Refresh Token")))
    ) {
      request.cookies.getAll().forEach((cookie) => {
        if (
          cookie.name.startsWith("sb-") ||
          cookie.name.includes("supabase") ||
          cookie.name.includes("auth-token")
        ) {
          supabaseResponse.cookies.set(cookie.name, "", {
            path: "/",
            expires: new Date(0),
            maxAge: 0,
            httpOnly: true,
            secure: true,
            sameSite: "lax",
          });
        }
      });
    }
  }

  return supabaseResponse;
}

import { createBrowserClient } from "@supabase/ssr";
import { AuthApiError } from "@supabase/supabase-js";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// Utility function to clear invalid sessions
export function clearInvalidSession() {
  // Clear localStorage items that Supabase might use
  if (typeof window !== "undefined") {
    const keysToRemove = [];

    // Find all keys that might be related to Supabase auth
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes("supabase") || key.includes("sb-"))) {
        keysToRemove.push(key);
      }
    }

    // Remove the keys
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Also clear sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes("supabase") || key.includes("sb-"))) {
        sessionStorage.removeItem(key);
      }
    }

    console.log("Cleared invalid session storage");
  }
}

// Complete session cleanup - clears everything
export function clearAllAuthData() {
  if (typeof window === "undefined") return;

  console.log("🧹 Performing complete auth data cleanup");

  // Clear localStorage
  const localStorageKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key &&
      (key.includes("supabase") || key.includes("sb-") || key.includes("auth"))
    ) {
      localStorageKeys.push(key);
    }
  }
  localStorageKeys.forEach((key) => localStorage.removeItem(key));

  // Clear sessionStorage
  const sessionStorageKeys = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (
      key &&
      (key.includes("supabase") || key.includes("sb-") || key.includes("auth"))
    ) {
      sessionStorageKeys.push(key);
    }
  }
  sessionStorageKeys.forEach((key) => sessionStorage.removeItem(key));

  // Clear cookies (client-side)
  document.cookie.split(";").forEach((cookie) => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    if (
      name.includes("sb-") ||
      name.includes("supabase") ||
      name.includes("auth")
    ) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  });

  console.log("🧹 Complete auth data cleanup finished");
}

// Global auth error handler utility
export function isRefreshTokenError(error: unknown): boolean {
  return (
    error instanceof AuthApiError &&
    (error.code === "refresh_token_not_found" ||
      (error.status === 400 && error.message.includes("Invalid Refresh Token")))
  );
}

// Handle auth errors consistently across the app
export async function handleAuthError(
  error: unknown,
  onSignOut?: () => void,
): Promise<boolean> {
  if (isRefreshTokenError(error)) {
    console.log("🔄 Handling refresh token error - clearing session");

    // Clear invalid session data
    clearAllAuthData();

    // Sign out from Supabase
    const supabase = createClient();
    await supabase.auth.signOut();

    // Call custom sign out handler if provided
    if (onSignOut) {
      onSignOut();
    }

    return true; // Indicates error was handled
  }

  return false; // Indicates error was not handled
}

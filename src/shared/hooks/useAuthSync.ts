import { useEffect, useState } from "react";

import { AuthApiError } from "@supabase/supabase-js";

import { useDispatch, useSelector } from "react-redux";

import { createClient, clearInvalidSession } from "@/utils/supabase/client";

import {
  setSupabaseUser,
  setLoading,
  setError,
} from "@/entities/user/model/authSlice";

import { RootState } from "@/shared/model/store";

export function useAuthSync() {
  const dispatch = useDispatch();
  const { user, loading, initialized } = useSelector(
    (state: RootState) => state.auth,
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const supabase = createClient();
    dispatch(setLoading(true));

    // Initial user fetch with error handling
    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (error && error instanceof AuthApiError) {
          if (
            error.code === "refresh_token_not_found" ||
            (error.status === 400 &&
              error.message.includes("Invalid Refresh Token"))
          ) {
            // Clear invalid session data
            clearInvalidSession();

            // Clear the session and sign out
            supabase.auth.signOut().then(() => {
              dispatch(setSupabaseUser(null));
            });
            return;
          }
        }

        dispatch(setSupabaseUser(data?.user ?? null));
      })
      .catch((error) => {
        console.error("Auth initialization error:", error);

        // Handle AuthApiError in catch block too
        if (
          error instanceof AuthApiError &&
          error.code === "refresh_token_not_found"
        ) {
          clearInvalidSession();
          dispatch(setSupabaseUser(null));
        } else {
          dispatch(setError("Authentication initialization failed"));
          dispatch(setSupabaseUser(null));
        }
      });

    // Listen for auth state changes with error handling
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "TOKEN_REFRESHED" && !session) {
          // Token refresh failed, clear the session
          clearInvalidSession();
          dispatch(setSupabaseUser(null));
        } else if (event === "SIGNED_OUT" || !session) {
          dispatch(setSupabaseUser(null));
        } else {
          dispatch(setSupabaseUser(session.user));
        }
      },
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [dispatch, isClient]);

  // Return safe defaults during SSR
  if (!isClient) {
    return { user: null, loading: true, initialized: false };
  }

  return { user, loading, initialized };
}

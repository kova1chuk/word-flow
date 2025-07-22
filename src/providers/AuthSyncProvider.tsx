"use client";

import { useEffect } from "react";

import { User as SupabaseUser, UserResponse } from "@supabase/supabase-js";

import { useDispatch } from "react-redux";

import {
  createClient,
  handleAuthError,
  clearInvalidSession,
} from "@/utils/supabase/client";

import {
  setUser,
  transformSupabaseUser,
  setSupabaseUser,
  setLoading,
} from "../entities/user/model/authSlice";

export function AuthSyncProvider({
  serverUser,
  children,
}: {
  serverUser: SupabaseUser | null;
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const supabase = createClient();

  useEffect(() => {
    if (serverUser) {
      dispatch(setUser(transformSupabaseUser(serverUser)));
    } else {
      // Handle auth state when no server user is present
      dispatch(setLoading(true));

      supabase.auth
        .getUser()
        .then(({ data, error }: UserResponse) => {
          if (error) {
            // Use the new auth error handler
            handleAuthError(error, () => dispatch(setSupabaseUser(null)));
            return;
          }

          dispatch(setSupabaseUser(data?.user ?? null));
        })
        .catch((error) => {
          console.error("Auth initialization error:", error);

          // Handle auth errors consistently
          const wasHandled = handleAuthError(error, () =>
            dispatch(setSupabaseUser(null)),
          );
          if (!wasHandled) {
            console.error("Authentication initialization failed:", error);
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
    }
  }, [dispatch, serverUser]);

  return <>{children}</>;
}

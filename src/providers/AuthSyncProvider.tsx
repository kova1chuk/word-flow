"use client";

import { useEffect } from "react";

import {
  User as SupabaseUser,
  UserResponse,
  Session,
} from "@supabase/supabase-js";

import { useDispatch } from "react-redux";

import {
  createClient,
  handleAuthError,
  clearInvalidSession,
} from "@/utils/supabase/client";

import type { AppDispatch } from "@/shared/model/store";

import {
  setUser,
  transformSupabaseUser,
  setSupabaseUser,
  setLoading,
} from "../entities/user/model/authSlice";

function syncServerUser(dispatch: AppDispatch, serverUser: SupabaseUser) {
  dispatch(setUser(transformSupabaseUser(serverUser)));
}

function fetchAndSyncSupabaseUser(
  dispatch: AppDispatch,
  supabase: ReturnType<typeof createClient>,
) {
  dispatch(setLoading(true));
  supabase.auth
    .getUser()
    .then(({ data, error }: UserResponse) => {
      if (error) {
        handleAuthError(error, () => dispatch(setSupabaseUser(null)));
        return;
      }
      dispatch(setSupabaseUser(data?.user ?? null));
    })
    .catch((error: unknown) => {
      const wasHandled = handleAuthError(error, () =>
        dispatch(setSupabaseUser(null)),
      );
      if (!wasHandled) {
        dispatch(setSupabaseUser(null));
      }
    });
}

function subscribeToAuthChanges(
  dispatch: AppDispatch,
  supabase: ReturnType<typeof createClient>,
) {
  const { data: listener } = supabase.auth.onAuthStateChange(
    (event: string, session: Session | null) => {
      if (event === "TOKEN_REFRESHED" && !session) {
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

export function AuthSyncProvider({
  serverUser,
  children,
}: {
  serverUser: SupabaseUser | null;
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const supabase = createClient();

  useEffect(() => {
    if (serverUser) {
      syncServerUser(dispatch, serverUser);
      return;
    }
    fetchAndSyncSupabaseUser(dispatch, supabase);
    return subscribeToAuthChanges(dispatch, supabase);
  }, [dispatch, serverUser]);

  return <>{children}</>;
}

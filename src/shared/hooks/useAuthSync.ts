import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { setUser, setLoading } from "@/entities/user/model/authSlice";

import { RootState } from "@/shared/model/store";

import { supabase } from "@/lib/supabaseClient";

import type { User } from "@supabase/supabase-js";

function mapSupabaseUser(user: User | null) {
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

export function useAuthSync() {
  const dispatch = useDispatch();
  const { user, loading, initialized } = useSelector(
    (state: RootState) => state.auth
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    dispatch(setLoading(true));

    // Initial user fetch
    supabase.auth.getUser().then(({ data }) => {
      dispatch(setUser(mapSupabaseUser(data?.user)));
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        dispatch(setUser(mapSupabaseUser(session?.user ?? null)));
      }
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

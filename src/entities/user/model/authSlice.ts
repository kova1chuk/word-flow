import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AuthState, User } from "../types";

import type { User as SupabaseUser } from "@supabase/supabase-js";

export const transformSupabaseUser = (supabaseUser: SupabaseUser): User => {
  return {
    id: supabaseUser.id,
    uid: supabaseUser.id,
    email: supabaseUser.email!,
    user_metadata: supabaseUser.user_metadata,
    app_metadata: supabaseUser.app_metadata,
    email_confirmed_at: supabaseUser.email_confirmed_at,
    phone: supabaseUser.phone,
    created_at: supabaseUser.created_at,
    updated_at: supabaseUser.updated_at,
    last_sign_in_at: supabaseUser.last_sign_in_at,
    createdAt: supabaseUser.created_at,
    displayName:
      supabaseUser.user_metadata?.display_name ||
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.email?.split("@")[0],
    photoURL: supabaseUser.user_metadata?.avatar_url,
    emailVerified: !!supabaseUser.email_confirmed_at,
  };
};

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
      state.initialized = true;
      state.loading = false;
    },
    setSupabaseUser: (state, action: PayloadAction<SupabaseUser | null>) => {
      const supabaseUser = action.payload;
      state.user = supabaseUser ? transformSupabaseUser(supabaseUser) : null;
      state.isAuthenticated = !!supabaseUser;
      state.error = null;
      state.initialized = true;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.initialized = true;
      state.loading = false;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },
    resetAuth: () => {
      return initialState;
    },
  },
});

export const {
  setUser,
  setSupabaseUser,
  setLoading,
  setError,
  clearError,
  logout,
  setInitialized,
  resetAuth,
} = authSlice.actions;
export default authSlice.reducer;

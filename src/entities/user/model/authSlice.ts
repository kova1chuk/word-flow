import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "../types";

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  initialized: false, // Firebase auth hasn't completed initial check yet
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
      state.initialized = true; // Auth check completed
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
      state.initialized = true; // Auth check completed
      state.loading = false;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },
    resetAuth: () => {
      // Reset to initial state (useful for testing or complete reset)
      return initialState;
    },
  },
});

export const {
  setUser,
  setLoading,
  setError,
  clearError,
  logout,
  setInitialized,
  resetAuth,
} = authSlice.actions;
export default authSlice.reducer;

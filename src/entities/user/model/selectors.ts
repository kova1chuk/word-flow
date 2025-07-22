import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "@/shared/model/store";

const selectAuthState = (state: RootState) => state.auth;

export const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user,
);

export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated,
);

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.loading,
);

export const selectAuthError = createSelector(
  [selectAuthState],
  (auth) => auth.error,
);

export const selectAuthInitialized = createSelector(
  [selectAuthState],
  (auth) => auth.initialized,
);

export const selectUserId = createSelector(
  [selectUser],
  (user) => user?.id || user?.uid,
);

export const selectUserEmail = createSelector(
  [selectUser],
  (user) => user?.email,
);

export const selectUserDisplayName = createSelector(
  [selectUser],
  (user) =>
    user?.displayName ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name,
);

export const selectUserPhotoURL = createSelector(
  [selectUser],
  (user) => user?.photoURL || user?.user_metadata?.avatar_url,
);

export const selectUserEmailVerified = createSelector(
  [selectUser],
  (user) => user?.emailVerified || !!user?.email_confirmed_at,
);

export const selectUserMetadata = createSelector(
  [selectUser],
  (user) => user?.user_metadata,
);

export const selectUserProvider = createSelector(
  [selectUser],
  (user) => user?.app_metadata?.provider,
);

export const selectUserProviders = createSelector(
  [selectUser],
  (user) => user?.app_metadata?.providers || [],
);

export const selectUserCreatedAt = createSelector(
  [selectUser],
  (user) => user?.created_at,
);

export const selectUserLastSignInAt = createSelector(
  [selectUser],
  (user) => user?.last_sign_in_at,
);

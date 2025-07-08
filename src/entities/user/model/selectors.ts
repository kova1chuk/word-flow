import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/shared/model/store";

// Base selectors
const selectAuthState = (state: RootState) => state.auth;

// Derived selectors
export const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);

export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.loading
);

export const selectAuthError = createSelector(
  [selectAuthState],
  (auth) => auth.error
);

export const selectAuthInitialized = createSelector(
  [selectAuthState],
  (auth) => auth.initialized
);

export const selectUserId = createSelector([selectUser], (user) => user?.uid);

export const selectUserEmail = createSelector(
  [selectUser],
  (user) => user?.email
);

export const selectUserDisplayName = createSelector(
  [selectUser],
  (user) => user?.displayName
);

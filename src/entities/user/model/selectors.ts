import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "@/shared/model/store";

const selectAuthState = (state: RootState) => state.auth;

export const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user,
);

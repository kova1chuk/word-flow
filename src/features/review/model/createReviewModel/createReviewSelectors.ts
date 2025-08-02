import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../../../../shared/model/store";

export const selectCreateReview = createSelector(
  (state: RootState) => state.createReview,
  (createReview) => createReview,
);

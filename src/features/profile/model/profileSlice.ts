import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import type { PublicUser } from "../api/profileSupabase";
import { setUserLanguages, getUserProfile } from "../api/profileSupabase";

export interface ProfileState {
  native_language: string;
  learning_language: string;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ProfileState = {
  native_language: "",
  learning_language: "",
  loading: false,
  error: null,
  success: false,
};

export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async () => {
    return await getUserProfile();
  }
);

export const saveLanguages = createAsyncThunk(
  "profile/saveLanguages",
  async ({ native, learning }: { native: string; learning: string }) => {
    return await setUserLanguages(native, learning);
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearSuccess: (state) => {
      state.success = false;
    },
    setLanguages: (
      state,
      action: PayloadAction<{ native: string; learning: string }>
    ) => {
      state.native_language = action.payload.native;
      state.learning_language = action.payload.learning;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProfile.fulfilled,
        (state, action: PayloadAction<PublicUser | null>) => {
          state.loading = false;
          if (action.payload) {
            state.native_language = action.payload.native_language;
            state.learning_language = action.payload.learning_language;
          }
        }
      )
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch profile";
      })
      .addCase(saveLanguages.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(saveLanguages.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (action.meta && action.meta.arg) {
          state.native_language = action.meta.arg.native;
          state.learning_language = action.meta.arg.learning;
        }
      })
      .addCase(saveLanguages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to save languages";
        state.success = false;
      });
  },
});

export const { clearSuccess, setLanguages } = profileSlice.actions;
export default profileSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FormState {
  // Auth forms
  auth: {
    email: string;
    password: string;
    confirmPassword: string;
    error: string;
    loading: boolean;
  };

  // Word forms
  word: {
    newWord: string;
    newDefinition: string;
    newExample: string;
    submitting: boolean;
    error: string;
  };

  // Analysis forms
  analysis: {
    title: string;
    isEditingTitle: boolean;
    isSaved: boolean;
  };

  // Training forms
  training: {
    selectedStatuses: string[];
    trainingMode: "word" | "sentence";
  };

  // Filter forms
  filters: {
    statusFilter: string;
    currentPage: number;
    pageSize: number;
  };
}

const initialState: FormState = {
  // Auth forms
  auth: {
    email: "",
    password: "",
    confirmPassword: "",
    error: "",
    loading: false,
  },

  // Word forms
  word: {
    newWord: "",
    newDefinition: "",
    newExample: "",
    submitting: false,
    error: "",
  },

  // Analysis forms
  analysis: {
    title: "",
    isEditingTitle: false,
    isSaved: false,
  },

  // Training forms
  training: {
    selectedStatuses: ["to_learn", "want_repeat", "unset"],
    trainingMode: "word",
  },

  // Filter forms
  filters: {
    statusFilter: "all",
    currentPage: 1,
    pageSize: 12,
  },
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    // Auth form actions
    setAuthEmail: (state, action: PayloadAction<string>) => {
      state.auth.email = action.payload;
    },
    setAuthPassword: (state, action: PayloadAction<string>) => {
      state.auth.password = action.payload;
    },
    setAuthConfirmPassword: (state, action: PayloadAction<string>) => {
      state.auth.confirmPassword = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.auth.error = action.payload;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.auth.loading = action.payload;
    },
    clearAuthForm: (state) => {
      state.auth.email = "";
      state.auth.password = "";
      state.auth.confirmPassword = "";
      state.auth.error = "";
      state.auth.loading = false;
    },

    // Word form actions
    setNewWord: (state, action: PayloadAction<string>) => {
      state.word.newWord = action.payload;
    },
    setNewDefinition: (state, action: PayloadAction<string>) => {
      state.word.newDefinition = action.payload;
    },
    setNewExample: (state, action: PayloadAction<string>) => {
      state.word.newExample = action.payload;
    },
    setWordSubmitting: (state, action: PayloadAction<boolean>) => {
      state.word.submitting = action.payload;
    },
    setWordError: (state, action: PayloadAction<string>) => {
      state.word.error = action.payload;
    },
    clearWordForm: (state) => {
      state.word.newWord = "";
      state.word.newDefinition = "";
      state.word.newExample = "";
      state.word.submitting = false;
      state.word.error = "";
    },

    // Analysis form actions
    setAnalysisTitle: (state, action: PayloadAction<string>) => {
      state.analysis.title = action.payload;
    },
    setAnalysisEditingTitle: (state, action: PayloadAction<boolean>) => {
      state.analysis.isEditingTitle = action.payload;
    },
    setAnalysisSaved: (state, action: PayloadAction<boolean>) => {
      state.analysis.isSaved = action.payload;
    },

    // Training form actions
    setSelectedStatuses: (state, action: PayloadAction<string[]>) => {
      state.training.selectedStatuses = action.payload;
    },
    setTrainingMode: (state, action: PayloadAction<"word" | "sentence">) => {
      state.training.trainingMode = action.payload;
    },

    // Filter form actions
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.statusFilter = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.filters.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.filters.pageSize = action.payload;
    },

    // Reset all forms
    resetAllForms: () => initialState,
  },
});

export const {
  setAuthEmail,
  setAuthPassword,
  setAuthConfirmPassword,
  setAuthError,
  setAuthLoading,
  clearAuthForm,
  setNewWord,
  setNewDefinition,
  setNewExample,
  setWordSubmitting,
  setWordError,
  clearWordForm,
  setAnalysisTitle,
  setAnalysisEditingTitle,
  setAnalysisSaved,
  setSelectedStatuses,
  setTrainingMode,
  setStatusFilter,
  setCurrentPage,
  setPageSize,
  resetAllForms,
} = formSlice.actions;

export default formSlice.reducer;

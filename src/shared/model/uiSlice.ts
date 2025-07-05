import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ModalState {
  isOpen: boolean;
  data?: unknown;
}

export interface UIState {
  // Header/Navigation
  isMenuOpen: boolean;
  isUserMenuOpen: boolean;

  // Modals
  showSettings: boolean;
  showWordInfo: boolean;
  showAddWordForm: boolean;

  // Forms
  isEditingTitle: boolean;
  isDragOver: boolean;

  // PWA
  showInstallPrompt: boolean;
  isOnline: boolean;
  isInstalled: boolean;

  // Notifications
  notificationVisible: boolean;

  // Loading states
  isReloading: boolean;
  isUpdating: boolean;
}

const initialState: UIState = {
  // Header/Navigation
  isMenuOpen: false,
  isUserMenuOpen: false,

  // Modals
  showSettings: false,
  showWordInfo: false,
  showAddWordForm: false,

  // Forms
  isEditingTitle: false,
  isDragOver: false,

  // PWA
  showInstallPrompt: false,
  isOnline: true,
  isInstalled: false,

  // Notifications
  notificationVisible: false,

  // Loading states
  isReloading: false,
  isUpdating: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Header/Navigation
    setIsMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMenuOpen = action.payload;
    },
    setIsUserMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isUserMenuOpen = action.payload;
    },
    closeAllMenus: (state) => {
      state.isMenuOpen = false;
      state.isUserMenuOpen = false;
    },

    // Modals
    setShowSettings: (state, action: PayloadAction<boolean>) => {
      state.showSettings = action.payload;
    },
    setShowWordInfo: (state, action: PayloadAction<boolean>) => {
      state.showWordInfo = action.payload;
    },
    setShowAddWordForm: (state, action: PayloadAction<boolean>) => {
      state.showAddWordForm = action.payload;
    },
    closeAllModals: (state) => {
      state.showSettings = false;
      state.showWordInfo = false;
      state.showAddWordForm = false;
    },

    // Forms
    setIsEditingTitle: (state, action: PayloadAction<boolean>) => {
      state.isEditingTitle = action.payload;
    },
    setIsDragOver: (state, action: PayloadAction<boolean>) => {
      state.isDragOver = action.payload;
    },

    // PWA
    setShowInstallPrompt: (state, action: PayloadAction<boolean>) => {
      state.showInstallPrompt = action.payload;
    },
    setIsOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setIsInstalled: (state, action: PayloadAction<boolean>) => {
      state.isInstalled = action.payload;
    },

    // Notifications
    setNotificationVisible: (state, action: PayloadAction<boolean>) => {
      state.notificationVisible = action.payload;
    },

    // Loading states
    setIsReloading: (state, action: PayloadAction<boolean>) => {
      state.isReloading = action.payload;
    },
    setIsUpdating: (state, action: PayloadAction<boolean>) => {
      state.isUpdating = action.payload;
    },
  },
});

export const {
  setIsMenuOpen,
  setIsUserMenuOpen,
  closeAllMenus,
  setShowSettings,
  setShowWordInfo,
  setShowAddWordForm,
  closeAllModals,
  setIsEditingTitle,
  setIsDragOver,
  setShowInstallPrompt,
  setIsOnline,
  setIsInstalled,
  setNotificationVisible,
  setIsReloading,
  setIsUpdating,
} = uiSlice.actions;

export default uiSlice.reducer;

import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/shared/model/store";
import { Notification } from "./notificationSlice";

// UI Selectors
export const selectUIState = (state: RootState) => state.ui;

// Header/Navigation
export const selectIsMenuOpen = createSelector(
  [selectUIState],
  (ui) => ui.isMenuOpen
);

export const selectIsUserMenuOpen = createSelector(
  [selectUIState],
  (ui) => ui.isUserMenuOpen
);

// Modals
export const selectShowSettings = createSelector(
  [selectUIState],
  (ui) => ui.showSettings
);

export const selectShowWordInfo = createSelector(
  [selectUIState],
  (ui) => ui.showWordInfo
);

export const selectShowAddWordForm = createSelector(
  [selectUIState],
  (ui) => ui.showAddWordForm
);

// Forms
export const selectIsEditingTitle = createSelector(
  [selectUIState],
  (ui) => ui.isEditingTitle
);

export const selectIsDragOver = createSelector(
  [selectUIState],
  (ui) => ui.isDragOver
);

// PWA
export const selectShowInstallPrompt = createSelector(
  [selectUIState],
  (ui) => ui.showInstallPrompt
);

export const selectIsOnline = createSelector(
  [selectUIState],
  (ui) => ui.isOnline
);

export const selectIsInstalled = createSelector(
  [selectUIState],
  (ui) => ui.isInstalled
);

// Loading states
export const selectIsReloading = createSelector(
  [selectUIState],
  (ui) => ui.isReloading
);

export const selectIsUpdating = createSelector(
  [selectUIState],
  (ui) => ui.isUpdating
);

// Form Selectors
export const selectFormState = (state: RootState) => state.form;

// Auth form
export const selectAuthForm = createSelector(
  [selectFormState],
  (form) => form.auth
);

export const selectAuthEmail = createSelector(
  [selectAuthForm],
  (auth) => auth.email
);

export const selectAuthPassword = createSelector(
  [selectAuthForm],
  (auth) => auth.password
);

export const selectAuthConfirmPassword = createSelector(
  [selectAuthForm],
  (auth) => auth.confirmPassword
);

export const selectAuthError = createSelector(
  [selectAuthForm],
  (auth) => auth.error
);

export const selectAuthLoading = createSelector(
  [selectAuthForm],
  (auth) => auth.loading
);

// Word form
export const selectWordForm = createSelector(
  [selectFormState],
  (form) => form.word
);

export const selectNewWord = createSelector(
  [selectWordForm],
  (word) => word.newWord
);

export const selectNewDefinition = createSelector(
  [selectWordForm],
  (word) => word.newDefinition
);

export const selectNewExample = createSelector(
  [selectWordForm],
  (word) => word.newExample
);

export const selectWordSubmitting = createSelector(
  [selectWordForm],
  (word) => word.submitting
);

export const selectWordError = createSelector(
  [selectWordForm],
  (word) => word.error
);

// Analysis form
export const selectAnalysisForm = createSelector(
  [selectFormState],
  (form) => form.analysis
);

export const selectAnalysisTitle = createSelector(
  [selectAnalysisForm],
  (analysis) => analysis.title
);

export const selectAnalysisEditingTitle = createSelector(
  [selectAnalysisForm],
  (analysis) => analysis.isEditingTitle
);

export const selectAnalysisSaved = createSelector(
  [selectAnalysisForm],
  (analysis) => analysis.isSaved
);

// Training form
export const selectTrainingForm = createSelector(
  [selectFormState],
  (form) => form.training
);

export const selectSelectedStatuses = createSelector(
  [selectTrainingForm],
  (training) => training.selectedStatuses
);

export const selectTrainingMode = createSelector(
  [selectTrainingForm],
  (training) => training.trainingMode
);

// Filter form
export const selectFilterForm = createSelector(
  [selectFormState],
  (form) => form.filters
);

export const selectStatusFilter = createSelector(
  [selectFilterForm],
  (filters) => filters.statusFilter
);

export const selectCurrentPage = createSelector(
  [selectFilterForm],
  (filters) => filters.currentPage
);

export const selectPageSize = createSelector(
  [selectFilterForm],
  (filters) => filters.pageSize
);

// Notification Selectors
export const selectNotificationState = (state: RootState) => state.notification;

export const selectNotifications = createSelector(
  [selectNotificationState],
  (notification) => notification.notifications
);

export const selectNotificationVisible = createSelector(
  [selectNotificationState],
  (notification) => notification.isVisible
);

export const selectLatestNotification = createSelector(
  [selectNotifications],
  (notifications) => notifications[notifications.length - 1] || null
);

export const selectSuccessNotifications = createSelector(
  [selectNotifications],
  (notifications) =>
    notifications.filter((n: Notification) => n.type === "success")
);

export const selectErrorNotifications = createSelector(
  [selectNotifications],
  (notifications) =>
    notifications.filter((n: Notification) => n.type === "error")
);

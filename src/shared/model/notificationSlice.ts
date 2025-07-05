import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
  timestamp: number;
}

export interface NotificationState {
  notifications: Notification[];
  isVisible: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  isVisible: false,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    showSuccess: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: "success",
        message: action.payload,
        duration: 5000,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
      state.isVisible = true;
    },

    showError: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: "error",
        message: action.payload,
        duration: 7000,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
      state.isVisible = true;
    },

    showInfo: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: "info",
        message: action.payload,
        duration: 4000,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
      state.isVisible = true;
    },

    showWarning: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: "warning",
        message: action.payload,
        duration: 6000,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
      state.isVisible = true;
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
      if (state.notifications.length === 0) {
        state.isVisible = false;
      }
    },

    clearAllNotifications: (state) => {
      state.notifications = [];
      state.isVisible = false;
    },

    setNotificationVisible: (state, action: PayloadAction<boolean>) => {
      state.isVisible = action.payload;
    },

    // Auto-remove expired notifications
    removeExpiredNotifications: (state) => {
      const now = Date.now();
      state.notifications = state.notifications.filter((notification) => {
        if (!notification.duration) return true;
        return now - notification.timestamp < notification.duration;
      });
      if (state.notifications.length === 0) {
        state.isVisible = false;
      }
    },
  },
});

export const {
  showSuccess,
  showError,
  showInfo,
  showWarning,
  removeNotification,
  clearAllNotifications,
  setNotificationVisible,
  removeExpiredNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;

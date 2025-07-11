"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

import { StatusMessages } from "@/features/notifications/ui/StatusMessages";

interface NotificationContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  clearMessages: () => void;
  error: string;
  success: string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const showSuccess = useCallback((message: string) => {
    setSuccess(message);
    setError(""); // Clear any existing error
  }, []);

  const showError = useCallback((message: string) => {
    setError(message);
    setSuccess(""); // Clear any existing success
  }, []);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showSuccess,
        showError,
        clearMessages,
        error,
        success,
      }}
    >
      {children}
      <StatusMessages error={error} success={success} />
    </NotificationContext.Provider>
  );
}

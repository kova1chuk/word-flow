"use client";

import { useEffect, useState } from "react";
import {
  registerServiceWorker,
  isPWAInstalled,
  addOnlineStatusListener,
  getPWAInstallPrompt,
  showNotification,
} from "@/shared/lib/pwa";

interface PWAProviderProps {
  children: React.ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Check if PWA is installed
    setIsInstalled(isPWAInstalled());

    // Set up online status listener
    const cleanup = addOnlineStatusListener(setIsOnline);

    // Check if user previously closed the install prompt
    const dismissed = localStorage.getItem("pwaInstallPromptDismissed");

    // Get install prompt
    getPWAInstallPrompt().then((prompt) => {
      if (prompt && !dismissed) {
        setShowInstallPrompt(true);
      }
    });

    // Show welcome notification if PWA is installed
    if (isPWAInstalled()) {
      showNotification("Welcome to Word Flow!", {
        body: "Your vocabulary learning app is ready to use.",
        tag: "welcome",
      });
    }

    return cleanup;
  }, []);

  // Show offline notification when connection is lost
  useEffect(() => {
    if (!isOnline) {
      showNotification("You're offline", {
        body: "Some features may be limited, but you can still review your saved words.",
        tag: "offline",
      });
    }
  }, [isOnline]);

  const handleCloseInstallPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem("pwaInstallPromptDismissed", "1");
  };

  return (
    <>
      {children}

      {/* Install prompt banner */}
      {showInstallPrompt && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Install Word Flow</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Install this app on your device for quick and easy access when
                you&apos;re on the go.
              </p>
            </div>
            <button
              onClick={handleCloseInstallPrompt}
              className="text-white hover:text-gray-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-4 left-4 right-4 bg-yellow-500 text-white p-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-center">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="text-sm font-medium">You&apos;re offline</span>
          </div>
        </div>
      )}
    </>
  );
};

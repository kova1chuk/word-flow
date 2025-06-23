export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("SW registered: ", registration);
      return registration;
    } catch (registrationError) {
      console.log("SW registration failed: ", registrationError);
    }
  }
};

export const unregisterServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log("SW unregistered");
    } catch (error) {
      console.log("SW unregistration failed: ", error);
    }
  }
};

export const requestNotificationPermission = async () => {
  if ("Notification" in window) {
    const permission = await Notification.requestPermission();
    return permission;
  }
  return "denied";
};

export const showNotification = (
  title: string,
  options?: NotificationOptions
) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      icon: "/favicon/android-chrome-192x192.png",
      badge: "/favicon/favicon-32x32.png",
      ...options,
    });
  }
};

export const isPWAInstalled = () => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
};

export const isOnline = () => {
  return navigator.onLine;
};

export const addOnlineStatusListener = (
  callback: (online: boolean) => void
) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
};

export const getPWAInstallPrompt = () => {
  return new Promise<Event | null>((resolve) => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      resolve(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Clean up after a timeout
    setTimeout(() => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      resolve(null);
    }, 10000);
  });
};

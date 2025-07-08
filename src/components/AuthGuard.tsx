"use client";

import { useSelector } from "react-redux";
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthInitialized,
} from "@/entities/user/model/selectors";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export default function AuthGuard({
  children,
  fallback = null,
  loadingComponent = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          Loading your account...
        </p>
      </div>
    </div>
  ),
}: AuthGuardProps) {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);
  const authInitialized = useSelector(selectAuthInitialized);

  // Show loading while Firebase is checking auth state
  if (!authInitialized || authLoading) {
    return <>{loadingComponent}</>;
  }

  // Show fallback (e.g., WelcomeScreen) if not authenticated
  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Show protected content if authenticated
  return <>{children}</>;
}

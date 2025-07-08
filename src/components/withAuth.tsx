"use client";

import { ComponentType } from "react";
import AuthGuard from "./AuthGuard";

interface WithAuthOptions {
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { fallback, loadingComponent } = options;

  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard fallback={fallback} loadingComponent={loadingComponent}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

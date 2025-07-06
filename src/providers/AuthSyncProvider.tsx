"use client";

import { useAuthSync } from "@/shared/hooks/useAuthSync";

export function AuthSyncProvider() {
  useAuthSync();
  return null;
}

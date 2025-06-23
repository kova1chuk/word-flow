// App configuration
export const APP_CONFIG = {
  name: "Word Flow",
  version: "1.0.0",
  description: "Vocabulary learning app",
} as const;

// API configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URI || "http://localhost:8000",
  timeout: 10000,
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  enableOxfordApi: true,
  enableTranslation: true,
  enableAudio: true,
} as const;

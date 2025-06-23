// API endpoints configuration
export const API_ENDPOINTS = {
  // Translation API using MyMemory
  translation: {
    baseUrl: "https://api.mymemory.translated.net/get",
  },

  // Dictionary API endpoint
  dictionary: "https://api.dictionaryapi.dev/api/v2/entries/en",

  // Oxford API endpoint
  oxford: "/api/oxford",

  // Backend Service Endpoints
  upload: `${
    process.env.NEXT_PUBLIC_BACKEND_URI || "http://localhost:8000"
  }/api/upload/`,
  subtitleAnalysis: `${
    process.env.NEXT_PUBLIC_BACKEND_URI || "http://localhost:8000"
  }/api/subtitle/`,
  textAnalysis: `${
    process.env.NEXT_PUBLIC_BACKEND_URI || "http://localhost:8000"
  }/api/text/`,
} as const;

// Check if we're using a custom backend
export const isCustomBackend = !!process.env.NEXT_PUBLIC_BACKEND_URI;

// Configuration utility for environment variables

// Base URI for backend services. Falls back to production URL if not set.
const backendUri =
  process.env.NEXT_PUBLIC_BACKEND_URI || "http://localhost:8000";

export const config = {
  // Translation API using MyMemory
  translationApi: {
    baseUrl: "https://api.mymemory.translated.net/get",
    // You can add an email here to get a higher request limit, but it's optional
    // email: "your-email@example.com"
  },

  // Dictionary API endpoint
  dictionaryApi: "https://api.dictionaryapi.dev/api/v2/entries",

  // --- Backend Service Endpoints ---
  // All backend services are derived from a single base URI.

  // Upload service for EPUB files
  uploadServiceUrl: `${backendUri}/api/epub/`,

  // Subtitle analysis service
  subtitleAnalysisUrl: `${backendUri}/api/subtitle/`,

  // Text analysis service
  textAnalysisUrl: `${backendUri}/api/text/`,

  // Check if we're using a custom backend
  isCustomBackend: !!process.env.NEXT_PUBLIC_BACKEND_URI,
} as const;

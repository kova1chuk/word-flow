// Configuration utility for environment variables
export const config = {
  // Backend URI for external APIs - defaults to LibreTranslate if not set
  backendUri: process.env.NEXT_BACKEND_URI || "https://libretranslate.de",

  // Dictionary API endpoint
  dictionaryApi: "https://api.dictionaryapi.dev/api/v2/entries/en",

  // Upload service URL - defaults to the current external service
  uploadServiceUrl:
    process.env.NEXT_UPLOAD_SERVICE_URL ||
    "https://word-flow-service-261316383596.europe-central2.run.app/upload/",

  // Check if we're using a custom backend
  isCustomBackend: !!process.env.NEXT_BACKEND_URI,

  // Check if we're using a custom upload service
  isCustomUploadService: !!process.env.NEXT_UPLOAD_SERVICE_URL,
} as const;

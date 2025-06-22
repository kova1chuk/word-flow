// Configuration utility for environment variables
export const config = {
  // Backend URI for external APIs
  translationApi: {
    baseUrl: "https://api.mymemory.translated.net/get",
    // You can add an email here to get a higher request limit, but it's optional
    // email: "your-email@example.com"
  },

  // Dictionary API endpoint
  dictionaryApi: "https://api.dictionaryapi.dev/api/v2/entries/en",

  // Upload service URL - defaults to the current external service
  uploadServiceUrl:
    `${process.env.NEXT_BACKEND_URI}/api/upload/` ||
    "https://word-flow-service-261316383596.europe-central2.run.app/api/upload/",

  // Subtitle analysis service URL
  subtitleAnalysisUrl:
    `${process.env.NEXT_BACKEND_URI}/api/subtitle/` ||
    "https://word-flow-service-261316383596.europe-central2.run.app/api/subtitle/",

  // Check if we're using a custom upload service
  isCustomUploadService: !!process.env.NEXT_UPLOAD_SERVICE_URL,
} as const;

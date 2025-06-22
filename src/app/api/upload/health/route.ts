import { NextResponse } from "next/server";
import { config } from "@/lib/config";

export async function GET() {
  try {
    const externalServiceUrl = config.uploadServiceUrl;

    // Try to make a simple request to check if the service is available
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      // For local services, try a POST request to see if the endpoint exists
      const response = await fetch(externalServiceUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ test: "health_check" }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return NextResponse.json({
        status: "healthy",
        serviceUrl: externalServiceUrl,
        responseStatus: response.status,
        isCustomService: config.isCustomBackend,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      return NextResponse.json(
        {
          status: "unhealthy",
          serviceUrl: externalServiceUrl,
          error:
            fetchError instanceof Error ? fetchError.message : "Unknown error",
          isCustomService: config.isCustomBackend,
        },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

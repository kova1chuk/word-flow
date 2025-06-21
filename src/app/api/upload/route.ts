import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    // Get the content type first
    const contentType = request.headers.get("content-type");

    console.log("Upload request received:");
    console.log("- Content-Type:", contentType);

    if (!contentType || !contentType.includes("multipart/form-data")) {
      console.log("Invalid content type:", contentType);
      return NextResponse.json(
        { error: "Invalid content type. Expected multipart/form-data." },
        { status: 400 }
      );
    }

    // Parse the FormData to get the file
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("No file found in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(
      "File received:",
      file.name,
      "Size:",
      file.size,
      "Type:",
      file.type
    );

    // Use the configurable upload service URL
    const externalServiceUrl = config.uploadServiceUrl;

    console.log(`Forwarding upload request to: ${externalServiceUrl}`);

    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for large files

    try {
      // Try sending the file directly as a File object
      const newFormData = new FormData();
      newFormData.append("file", file);

      console.log("Sending file to external service...");

      const response = await fetch(externalServiceUrl, {
        method: "POST",
        body: newFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`External service response status: ${response.status}`);

      if (!response.ok) {
        console.error(
          `Upload service responded with status: ${response.status}`
        );
        let errorData;
        try {
          errorData = await response.json();
          console.log("Error data from external service:", errorData);
        } catch {
          errorData = {
            error: `Upload service error: ${response.status} ${response.statusText}`,
          };
        }
        return NextResponse.json(errorData, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          { error: "Upload service request timed out. Please try again." },
          { status: 408 }
        );
      }

      console.error("Fetch error:", fetchError);
      console.error(
        "Fetch error cause:",
        fetchError instanceof Error ? fetchError.cause : "No cause"
      );

      return NextResponse.json(
        {
          error:
            "Upload service is currently unavailable. Please try again later.",
          details:
            fetchError instanceof Error
              ? fetchError.message
              : "Unknown fetch error",
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Error in proxy route:", error);

    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    const stack = error instanceof Error ? error.stack : "No stack trace";

    return NextResponse.json(
      {
        error: "Failed to process the request via proxy.",
        details: message,
        proxy_error_stack: stack,
        proxy_error_name: error instanceof Error ? error.name : "UnknownError",
      },
      { status: 500 }
    );
  }
}

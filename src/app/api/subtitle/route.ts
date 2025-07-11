import { NextRequest, NextResponse } from "next/server";

import { config } from "@/lib/config";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Forward the file to the actual analysis service
  const serviceFormData = new FormData();
  serviceFormData.append("file", file);

  try {
    const response = await fetch(config.subtitleAnalysisUrl, {
      method: "POST",
      body: serviceFormData,
    });

    if (!response.ok) {
      // Pass the error from the service through
      const errorData = await response.json().catch(() => ({
        error: `Backend service error: ${response.status} ${response.statusText}`,
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error forwarding subtitle analysis request:", error);

    // Check if it's a connection error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error:
            "Backend service is not available. Please ensure the analysis service is running on http://localhost:8000",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

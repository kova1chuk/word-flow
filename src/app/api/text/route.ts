import { NextRequest, NextResponse } from "next/server";

import { config } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text;

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    console.log(
      `Forwarding text analysis request to: ${config.textAnalysisUrl}`
    );

    // Forward the text to the actual analysis service
    const response = await fetch(config.textAnalysisUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      // Pass the error from the service through, handling non-JSON errors
      const contentType = response.headers.get("content-type");
      let errorData;
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
      } else {
        const errorText = await response.text();
        console.error("Backend service returned non-JSON error:", errorText);
        errorData = {
          detail: `Backend service error: ${errorText.substring(0, 200)}...`,
        };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error forwarding text analysis request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

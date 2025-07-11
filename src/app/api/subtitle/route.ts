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
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error forwarding subtitle analysis request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

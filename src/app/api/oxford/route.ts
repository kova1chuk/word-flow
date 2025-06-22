import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word");

  if (!word) {
    return NextResponse.json(
      { error: "Word parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://od-api-sandbox.oxforddictionaries.com/api/v2/entries/en/${encodeURIComponent(
        word
      )}`,
      {
        headers: {
          app_id: process.env.NEXT_PUBLIC_OXFORD_API_APP_ID!,
          app_key: process.env.NEXT_PUBLIC_OXFORD_API_APP_KEY!,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Oxford API error: ${response.status} ${response.statusText}`,
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Oxford API proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch from Oxford API",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

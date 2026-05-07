import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const apiKey = process.env.INCEPTION_API_KEY;
    if (!apiKey) {
      console.error("INCEPTION_API_KEY is not set in environment");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    const response = await fetch(
      "https://api.inceptionlabs.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "mercury-2",
          messages: [{ role: "user", content: query }],
          reasoning_effort: "medium",
          temperature: 0.75,
          max_tokens: 8192,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("InceptionLabs API error:", data);
      return NextResponse.json(
        { error: data.error?.message || "API request failed" },
        { status: response.status },
      );
    }

    if (!data.choices?.[0]?.message?.content) {
      console.error("Unexpected API response:", data);
      return NextResponse.json(
        { error: "Invalid response structure" },
        { status: 500 },
      );
    }

    return NextResponse.json({ content: data.choices[0].message.content });
  } catch (error) {
    console.error("Error in inception API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

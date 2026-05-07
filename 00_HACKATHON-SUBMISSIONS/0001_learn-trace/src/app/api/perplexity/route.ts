// src/app/api/perplexity/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const apiKey = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.error("Missing PERPLEXITY_API_KEY");
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  console.log("Loaded API key:", apiKey);

  try {
    const perplexityRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [{ role: "user", content: body.query }],
      }),
    });

    if (!perplexityRes.ok) {
      const text = await perplexityRes.text();
      console.error(`Perplexity error ${perplexityRes.status}:`, text);
      return NextResponse.json({ error: "Perplexity API failed", details: text }, { status: perplexityRes.status });
    }

    const data = await perplexityRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected server error:", error);
    return NextResponse.json({ error: "Server error", details: error }, { status: 500 });
  }
}

// src/app/api/summarize/route.js

export async function POST(req) {
  try {
    const { text } = await req.json();

    const response = await fetch("http://localhost:5000/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemma:2b",
        prompt: `Summarize this email: ${text}`,
        stream: false // 👈 important: get one JSON object instead of streaming
      }),
    });

    const data = await response.json();

    const summary =
      data.response || data.output?.[0]?.content || "No summary generated.";

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ message: "Error generating summary" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

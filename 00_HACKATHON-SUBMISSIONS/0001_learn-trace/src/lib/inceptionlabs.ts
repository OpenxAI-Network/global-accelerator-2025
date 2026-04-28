// src/lib/inceptionlabs.ts
export async function fetchFromPerplexity(query: string) {
  try {
    const response = await fetch("/api/inception", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API request failed");
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error in fetchFromPerplexity:", error);
    throw error;
  }
}

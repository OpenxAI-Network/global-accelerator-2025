// src/lib/perplexity.ts
export async function fetchFromPerplexity(query: string) {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "pplx-70b-online",  // or other model name you're using
      messages: [{ role: "user", content: query }]
    })
  });

  if (!response.ok) {
    throw new Error("Perplexity API request failed");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

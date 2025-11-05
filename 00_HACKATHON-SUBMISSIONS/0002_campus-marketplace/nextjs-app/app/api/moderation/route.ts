import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";

const model = "llama3.2:1b";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { title, description } = data;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const moderationPrompt = `
You are a content moderator for a student marketplace. Review the following item listing for appropriateness:

Title: "${title}"
Description: "${description}"

Check for:
1. Illegal items (drugs, weapons, stolen goods)
2. Inappropriate content (adult material, hate speech)
3. Prohibited items (tobacco, alcohol, e-cigarettes)
4. Misleading or fraudulent content

Respond with only "APPROVED" if the content is appropriate, or "REJECTED: [reason]" if it violates guidelines.

Guidelines:
- No illegal items
- No inappropriate or offensive content
- No fake or misleading listings
- No tobacco, alcohol, or vaping products
- Be respectful and honest
`;

    const response = await ollama.chat({
      model,
      messages: [{ role: "user", content: moderationPrompt }],
    });

    const result = response.message.content.trim();
    
    if (result === "APPROVED") {
      return NextResponse.json({ approved: true });
    } else if (result.startsWith("REJECTED:")) {
      return NextResponse.json({ 
        approved: false, 
        reason: result.replace("REJECTED:", "").trim() 
      });
    } else {
      return NextResponse.json({ 
        approved: false, 
        reason: "Unable to determine content appropriateness" 
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Moderation failed" },
      { status: 500 }
    );
  }
}




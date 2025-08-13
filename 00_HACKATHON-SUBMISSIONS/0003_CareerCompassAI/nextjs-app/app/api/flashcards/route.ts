import { NextRequest, NextResponse } from 'next/server';

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardsResponse {
  success: boolean;
  flashcards?: Flashcard[];
  error?: string;
  source: 'ollama' | 'fallback';
}

function extractAndParseJSON(text: string): any {
  let cleanText = text.trim();

  // Remove markdown code fences
  cleanText = cleanText.replace(/```/g, '');

  try {
    const directParse = JSON.parse(cleanText);

    // If Ollama mistakenly returns back as JSON string, fix it
    if (
      directParse.front &&
      typeof directParse.back === 'string' &&
      directParse.back.trim().startsWith('{')
    ) {
      try {
        const inner = JSON.parse(directParse.back);
        // Merge values into one string
        directParse.back = Object.values(inner).join(' ');
      } catch {
        // leave as-is if parse fails
      }
    }

    // Case 1: Already has flashcards array
    if (directParse.flashcards && Array.isArray(directParse.flashcards)) {
      return directParse;
    }

    // Case 2: Single flashcard object
    if (directParse.front && directParse.back) {
      return { flashcards: [directParse] };
    }

    // Case 3: Array of flashcard objects
    if (
      Array.isArray(directParse) &&
      directParse.length > 0 &&
      directParse[0].front &&
      directParse[0].back
    ) {
      return { flashcards: directParse };
    }
  } catch (error) {
    console.log('Direct parsing failed:', error);
  }

  // throw new Error('Unable to extract valid JSON');
}

export async function POST(req: NextRequest) {
  try {
    const { notes } = await req.json();

    if (!notes || notes.trim().length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: 'Notes must be at least 20 characters long',
        } as FlashcardsResponse,
        { status: 400 }
      );
    }

    // Stronger prompt to enforce correct JSON output
    const prompt = `Create exactly 3-4 flashcards from the following notes.
Output MUST be valid JSON only — no markdown, no extra text.
Each flashcard should have:
- "front": plain text question or term
- "back": plain text answer or explanation

Format:
{
  "flashcards": [
    { "front": "definition here", "back": "expalnation breifly here" }
  ]
}

Do NOT include nested JSON or escape sequences inside "front" or "back".

Notes: ${notes}`;

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2:1b',
          prompt,
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        try {
          console.log('Raw Ollama response:', data.response);

          const parsed = extractAndParseJSON(data.response);

          if (
            parsed.flashcards &&
            Array.isArray(parsed.flashcards) &&
            parsed.flashcards.length > 0
          ) {
            const validFlashcards = parsed.flashcards
              .filter(
                (card: any) =>
                  card.front &&
                  card.back &&
                  typeof card.front === 'string' &&
                  typeof card.back === 'string' &&
                  card.front.trim().length > 2 &&
                  card.back.trim().length > 5
              )
              .map((card: any) => ({
                front: card.front.trim(),
                back: card.back.trim(),
              }));

            if (validFlashcards.length > 0) {
              console.log(
                'Successfully parsed flashcards:',
                validFlashcards.length
              );
              return NextResponse.json({
                success: true,
                flashcards: validFlashcards,
                source: 'ollama',
              } as FlashcardsResponse);
            }
          }
        } catch (parseError) {
          console.log('JSON parsing failed:', parseError);
          console.log('Failed text:', data.response?.substring(0, 500));
        }
      }
    } catch (ollamaError) {
      console.log('Ollama error:', ollamaError);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate valid flashcards from AI response',
      } as FlashcardsResponse,
      { status: 500 }
    );
  } catch (error) {
    console.error('Flashcards API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate flashcards',
      } as FlashcardsResponse,
      { status: 500 }
    );
  }
}

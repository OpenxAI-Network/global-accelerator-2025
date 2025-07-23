import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { notes } = await req.json()

    if (!notes) {
      return NextResponse.json(
        { error: 'Notes are required' },
        { status: 400 }
      )
    }

    const prompt = `You are an expert educational content creator. Create high-quality flashcards from the following notes that will help students learn effectively.

INSTRUCTIONS:
- Generate exactly 6-8 flashcards covering the most important concepts
- Create diverse question types: definitions, explanations, examples, and applications
- Make questions clear, specific, and educational
- Keep answers concise but complete (1-3 sentences max)
- Focus on understanding, not just memorization
- Use varied question formats (What is...?, How does...?, Why...?, When...?)

CRITICAL: Return ONLY valid JSON in exactly this format with no extra text, quotes escaped properly:

{"flashcards":[{"front":"Question text","back":"Answer text"},{"front":"Question text","back":"Answer text"}]}

STUDY MATERIAL:
${notes}

JSON Response:`

    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: prompt,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get response from Ollama')
    }

    const data = await response.json()
    
    try {
      // Clean and parse JSON from the response
      let responseText = data.response.trim()
      
      // Remove any markdown code blocks
      responseText = responseText.replace(/```json\s*|\s*```/g, '')
      
      // Find the JSON object containing flashcards
      const jsonMatch = responseText.match(/\{[\s\S]*?"flashcards"[\s\S]*?\}(?=\s*$|$)/m)
      if (jsonMatch) {
        let jsonStr = jsonMatch[0]
        
        // Clean up common JSON issues
        jsonStr = jsonStr
          .replace(/\\'/g, "'")  // Fix escaped single quotes
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Quote unquoted keys
          .replace(/:\s*'([^']*)'/g, ': "$1"')  // Replace single quotes with double quotes
        
        try {
          const flashcardsData = JSON.parse(jsonStr)
          if (flashcardsData.flashcards && Array.isArray(flashcardsData.flashcards)) {
            // Clean up each flashcard object to ensure proper format
            const cleanFlashcards = flashcardsData.flashcards.map(card => ({
              front: card.front || "Question",
              back: card.back || "Answer"
            }))
            return NextResponse.json({ flashcards: cleanFlashcards })
          }
        } catch (cleanParseError) {
          console.log('Clean JSON parsing failed:', cleanParseError.message)
        }
      }
    } catch (parseError) {
      console.log('Initial JSON parsing failed:', parseError.message)
    }

    // Fallback: create a simple structure from the response
    return NextResponse.json({
      flashcards: [
        {
          front: "Generated from your notes",
          back: data.response || 'No response from model'
        }
      ]
    })
  } catch (error) {
    console.error('Flashcards API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate flashcards' },
      { status: 500 }
    )
  }
} 
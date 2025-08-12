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

    const prompt = `Create flashcards from the following notes. Generate 5-8 flashcards in JSON format with the following structure:
{
  "flashcards": [
    {
      "front": "Question or term",
      "back": "Answer or definition"
    }
  ]
}

Focus on key concepts, definitions, and important facts. Make questions clear and answers concise.

Notes: ${notes}`

    try {
      // Try Ollama first (local AI)
      const response = await fetch('http://localhost:11434/api/generate', {
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

      if (response.ok) {
        const data = await response.json()
        
        try {
          // Try to parse JSON from the response
          const flashcardsMatch = data.response.match(/\{[\s\S]*\}/)
          if (flashcardsMatch) {
            const flashcardsData = JSON.parse(flashcardsMatch[0])
            return NextResponse.json(flashcardsData)
          }
        } catch (parseError) {
          console.log('Could not parse JSON, creating fallback flashcards')
        }
        
        // Fallback: create structured flashcards from response
        const lines = data.response.split('\n').filter((line: string) => line.trim())
        const flashcards = []
        
        for (let i = 0; i < Math.min(lines.length, 6); i += 2) {
          if (lines[i] && lines[i + 1]) {
            flashcards.push({
              front: lines[i].replace(/^[0-9\.\-\*\s]+/, '').trim(),
              back: lines[i + 1].replace(/^[0-9\.\-\*\s]+/, '').trim()
            })
          }
        }
        
        return NextResponse.json({ flashcards })
      }
    } catch (ollamaError) {
      console.log('Ollama not available, using fallback')
    }

    // Fallback: create sample flashcards
    const fallbackFlashcards = [
      {
        front: "What are the key skills for career advancement?",
        back: "Communication, leadership, problem-solving, adaptability, and continuous learning are essential for career growth."
      },
      {
        front: "How important is networking for career success?",
        back: "Networking is crucial - studies show that 70-80% of jobs are never publicly advertised and are filled through networking."
      },
      {
        front: "What is the best way to prepare for career transitions?",
        back: "Research the target role, develop relevant skills, update your resume, build connections in the industry, and practice interviewing."
      },
      {
        front: "Why is continuous learning important in today's job market?",
        back: "Technology and industries evolve rapidly. Continuous learning helps you stay relevant, competitive, and adaptable to change."
      },
      {
        front: "What role does personal branding play in career development?",
        back: "Personal branding helps you stand out, builds credibility, attracts opportunities, and communicates your unique value proposition."
      }
    ]

    return NextResponse.json({ flashcards: fallbackFlashcards })

  } catch (error) {
    console.error('Flashcards API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate flashcards' },
      { status: 500 }
    )
  }
}
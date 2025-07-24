import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'

// Simple in-memory cache with expiration
interface CacheEntry {
  flashcards: any[]
  timestamp: number
}

const flashcardCache = new Map<string, CacheEntry>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

function getCacheKey(notes: string): string {
  return crypto.createHash('md5').update(notes.trim().toLowerCase()).digest('hex')
}

function getCachedFlashcards(notes: string): any[] | null {
  const key = getCacheKey(notes)
  const entry = flashcardCache.get(key)
  
  if (entry && (Date.now() - entry.timestamp) < CACHE_DURATION) {
    console.log('Cache hit for flashcards!')
    return entry.flashcards
  }
  
  // Clean up expired entries
  if (entry) {
    flashcardCache.delete(key)
  }
  
  return null
}

function setCachedFlashcards(notes: string, flashcards: any[]): void {
  const key = getCacheKey(notes)
  flashcardCache.set(key, {
    flashcards,
    timestamp: Date.now()
  })
  console.log('Cached flashcards for future use')
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { notes } = await req.json()

    if (!notes) {
      return NextResponse.json(
        { error: 'Notes are required' },
        { status: 400 }
      )
    }

    // Check cache first for instant response
    const cachedFlashcards = getCachedFlashcards(notes)
    if (cachedFlashcards) {
      // Return cached result immediately
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            flashcards: cachedFlashcards,
            cached: true
          })}\n\n`))
          controller.close()
        }
      })
      
      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    const prompt = `Create educational flashcards from the following notes. Return ONLY valid JSON with no additional text.

Format (exactly):
{"flashcards":[{"front":"What is X?","back":"X is..."},{"front":"How does Y work?","back":"Y works by..."}]}

Generate 6-8 flashcards with:
- Clear questions (What/How/Why/When)
- Concise answers (1-2 sentences)
- Educational value

Notes: ${notes}

JSON:`

    // Create streaming response for real-time user feedback
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama3.2:1b',
              prompt: prompt,
              stream: true, // Enable streaming!
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to get response from Ollama')
          }

          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('No response body')
          }

          let fullResponse = ''
          const decoder = new TextDecoder()

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n').filter(line => line.trim())
            
            for (const line of lines) {
              try {
                const data = JSON.parse(line)
                if (data.response) {
                  fullResponse += data.response
                  // Send progress update to client
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'progress',
                    content: data.response,
                    fullContent: fullResponse
                  })}\n\n`))
                }
                
                if (data.done) {
                  // Parse final response and send flashcards
                  const flashcards = await parseFlashcards(fullResponse)
                  
                  // Cache the result for future use
                  setCachedFlashcards(notes, flashcards)
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'complete',
                    flashcards: flashcards
                  })}\n\n`))
                  controller.close()
                  return
                }
              } catch (parseError) {
                // Continue processing other lines
                continue
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: 'Failed to generate flashcards'
          })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Flashcards API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate flashcards' },
      { status: 500 }
    )
  }
}

// Helper function to parse flashcards from AI response
async function parseFlashcards(responseText: string) {
  try {
    console.log('Parsing response:', responseText.substring(0, 200) + '...')
    
    // Clean the response text
    let cleanText = responseText.trim()
    
    // Remove markdown code blocks
    cleanText = cleanText.replace(/```json\s*/g, '').replace(/\s*```/g, '')
    
    // Try to find JSON structure - be more flexible
    let jsonMatch = cleanText.match(/\{[\s\S]*?"flashcards"[\s\S]*?\][\s\S]*?\}/m)
    
    if (jsonMatch) {
      let jsonStr = jsonMatch[0]
      
      // Fix common JSON issues more aggressively
      jsonStr = jsonStr
        .replace(/\\'/g, "'")  // Fix escaped single quotes
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Quote unquoted keys
        .replace(/:\s*'([^']*)'/g, ': "$1"')  // Replace single quotes with double quotes
        .replace(/,\s*}/g, '}')  // Remove trailing commas
        .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
        .replace(/"\s*,\s*"([^"]*?)"/g, '", "$1"')  // Fix quote issues
      
      console.log('Attempting to parse:', jsonStr.substring(0, 300) + '...')
      
      try {
        const flashcardsData = JSON.parse(jsonStr)
        if (flashcardsData.flashcards && Array.isArray(flashcardsData.flashcards)) {
          const validFlashcards = flashcardsData.flashcards
            .filter((card: any) => card && typeof card === 'object' && card.front && card.back)
            .map((card: any) => ({
              front: String(card.front).trim(),
              back: String(card.back).trim()
            }))
          
          if (validFlashcards.length > 0) {
            console.log(`Successfully parsed ${validFlashcards.length} flashcards`)
            return validFlashcards
          }
        }
      } catch (parseError) {
        console.log('JSON parse error:', parseError.message)
      }
    }
    
    // Alternative approach: Try to extract individual flashcards with regex
    const cardMatches = cleanText.match(/"front":\s*"([^"]*?)"\s*,\s*"back":\s*"([^"]*?)"/g)
    if (cardMatches && cardMatches.length > 0) {
      console.log(`Found ${cardMatches.length} flashcard matches with regex`)
      const extractedCards = cardMatches.map(match => {
        const frontMatch = match.match(/"front":\s*"([^"]*?)"/)
        const backMatch = match.match(/"back":\s*"([^"]*?)"/)
        return {
          front: frontMatch ? frontMatch[1] : "Question",
          back: backMatch ? backMatch[1] : "Answer"
        }
      })
      return extractedCards
    }
    
  } catch (error) {
    console.log('Parse error:', error.message)
  }

  // Fallback: create multiple cards from the text content
  console.log('Using fallback parsing method')
  const sentences = responseText.split(/[.!?]+/).filter(s => s.trim().length > 10)
  if (sentences.length >= 2) {
    const cards = []
    for (let i = 0; i < Math.min(sentences.length - 1, 6); i++) {
      cards.push({
        front: `What can you tell me about: "${sentences[i].trim()}"?`,
        back: sentences[i + 1]?.trim() || "Related information from your notes."
      })
    }
    return cards
  }
  
  // Final fallback
  return [
    {
      front: "Generated from your notes",
      back: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
    }
  ]
}
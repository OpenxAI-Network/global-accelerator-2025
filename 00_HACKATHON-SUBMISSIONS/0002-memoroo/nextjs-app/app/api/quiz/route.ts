import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

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

    const { text } = await req.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const prompt = `Create a quiz from this text. Return ONLY valid JSON with no additional text.

Format (exactly):
{"quiz":[{"question":"What is X?","options":["Correct","Wrong1","Wrong2","Wrong3"],"correct":0,"explanation":"Why it's correct"}]}

Generate 3-4 questions with:
- Clear questions
- 4 answer choices each
- Correct answer index (0-3)
- Brief explanations

Text: ${text}

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
              stream: true,
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
                  // Parse final response and send quiz
                  const quiz = await parseQuiz(fullResponse)
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'complete',
                    quiz: quiz
                  })}\n\n`))
                  controller.close()
                  return
                }
              } catch (parseError) {
                continue
              }
            }
          }
        } catch (error) {
          console.error('Quiz streaming error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: 'Failed to generate quiz'
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
    console.error('Quiz API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    )
  }
}

// Helper function to parse quiz from AI response
async function parseQuiz(responseText: string) {
  try {
    console.log('Parsing quiz response:', responseText.substring(0, 200) + '...')
    
    // Clean the response text
    let cleanText = responseText.trim()
    
    // Remove markdown code blocks
    cleanText = cleanText.replace(/```json\s*/g, '').replace(/\s*```/g, '')
    
    // Handle multiple JSON objects - take the first complete one
    const jsonObjects = cleanText.split('\n\n').filter(obj => obj.trim().startsWith('{'))
    
    for (const jsonStr of jsonObjects) {
      try {
        const quizData = JSON.parse(jsonStr.trim())
        if (quizData.quiz && Array.isArray(quizData.quiz)) {
          const validQuiz = quizData.quiz
            .filter((q: any) => q && typeof q === 'object' && q.question && q.options && Array.isArray(q.options))
            .map((q: any) => ({
              question: String(q.question).trim(),
              options: q.options.map((opt: any) => String(opt).trim()),
              correct: Number(q.correct) || 0,
              explanation: String(q.explanation || 'No explanation provided').trim()
            }))
          
          if (validQuiz.length > 0) {
            console.log(`Successfully parsed ${validQuiz.length} quiz questions from first valid JSON`)
            return validQuiz
          }
        }
      } catch (parseError) {
        continue // Try next JSON object
      }
    }
    
    // Try to find JSON structure - be more flexible with the pattern
    let jsonMatch = cleanText.match(/\{[\s\S]*?"quiz"[\s\S]*?\]/m)
    
    if (jsonMatch) {
      // Find the complete JSON object by counting braces
      let jsonStr = ''
      let braceCount = 0
      let startFound = false
      
      for (let i = 0; i < cleanText.length; i++) {
        const char = cleanText[i]
        if (char === '{') {
          if (!startFound) startFound = true
          braceCount++
        } else if (char === '}') {
          braceCount--
        }
        
        if (startFound) {
          jsonStr += char
          if (braceCount === 0) break
        }
      }
      
      console.log('Attempting to parse quiz JSON:', jsonStr.substring(0, 500) + '...')
      
      try {
        // Fix common JSON issues
        jsonStr = jsonStr
          .replace(/\\'/g, "'")  // Fix escaped single quotes
          .replace(/,\s*}/g, '}')  // Remove trailing commas
          .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
        
        const quizData = JSON.parse(jsonStr)
        if (quizData.quiz && Array.isArray(quizData.quiz)) {
          const validQuiz = quizData.quiz
            .filter((q: any) => q && typeof q === 'object' && q.question && q.options && Array.isArray(q.options))
            .map((q: any) => ({
              question: String(q.question).trim(),
              options: q.options.map((opt: any) => String(opt).trim()),
              correct: Number(q.correct) || 0,
              explanation: String(q.explanation || 'No explanation provided').trim()
            }))
          
          if (validQuiz.length > 0) {
            console.log(`Successfully parsed ${validQuiz.length} quiz questions`)
            return validQuiz
          }
        }
      } catch (parseError) {
        console.log('Quiz JSON parse error:', parseError.message)
        console.log('Problematic JSON string:', jsonStr)
      }
    }
    
    // Alternative approach: Try to extract individual quiz questions with regex
    const questionMatches = cleanText.match(/"question":\s*"([^"]*?)"/g)
    if (questionMatches && questionMatches.length > 0) {
      console.log(`Found ${questionMatches.length} quiz questions with regex`)
      const extractedQuiz = []
      
      // Look for complete question objects
      const questionPattern = /"question":\s*"([^"]*?)"[\s\S]*?"options":\s*\[([^\]]*?)\][\s\S]*?"correct":\s*(\d+)[\s\S]*?"explanation":\s*"([^"]*?)"/g
      let match
      
      while ((match = questionPattern.exec(cleanText)) !== null) {
        const [, question, optionsStr, correct, explanation] = match
        const options = optionsStr.split(',').map(opt => opt.replace(/"/g, '').trim()).filter(opt => opt.length > 0)
        
        if (options.length >= 2) {
          extractedQuiz.push({
            question: question.trim(),
            options: options,
            correct: parseInt(correct) || 0,
            explanation: explanation.trim()
          })
        }
      }
      
      if (extractedQuiz.length > 0) {
        console.log(`Successfully extracted ${extractedQuiz.length} quiz questions with regex`)
        return extractedQuiz
      }
    }
    
  } catch (error) {
    console.log('Quiz parse error:', error.message)
  }

  // Fallback: create a simple quiz structure
  return [
    {
      question: "What is the main topic of the provided text?",
      options: ["Topic A", "Topic B", "Topic C", "Topic D"],
      correct: 0,
      explanation: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
    }
  ]
}
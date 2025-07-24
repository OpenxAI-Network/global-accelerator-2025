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

    const { question } = await req.json()

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    const prompt = `You are Memoroo, an enthusiastic and knowledgeable AI study buddy. Your goal is to help students learn effectively by providing comprehensive, engaging explanations.

INSTRUCTIONS:
- Answer the question clearly and accurately
- Break down complex concepts into digestible parts
- Provide relevant examples or analogies when helpful
- Connect the topic to real-world applications when possible
- Use an encouraging, friendly tone that motivates learning
- If the question is unclear, ask for clarification
- Suggest related concepts the student might want to explore
- Keep responses focused but thorough (2-4 paragraphs typically)

TEACHING APPROACH:
- Start with a direct answer to the question
- Explain the "why" behind the answer
- Provide context or background when relevant
- End with encouragement or next steps for learning

Student's Question: ${question}

Provide a helpful, educational response:`

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
                  // Send final answer
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'complete',
                    answer: fullResponse || 'I could not process your question. Please try again!'
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
          console.error('Study buddy streaming error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: 'Failed to get study buddy response'
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
    console.error('Study Buddy API error:', error)
    return NextResponse.json(
      { error: 'Failed to get study buddy response' },
      { status: 500 }
    )
  }
} 
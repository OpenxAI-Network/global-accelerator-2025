import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json()

    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 })
    }

    // Send content to Ollama for summarization
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: `Please provide a concise and intelligent summary of the following text. Focus on the key points, main ideas, and important details. Make it easy to understand and well-organized:

Text: "${content}"

Summary:`,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get response from Ollama')
    }

    const data = await response.json()
    
    return NextResponse.json({ 
      summary: data.response || 'Unable to generate summary at this time.'
    })
  } catch (error) {
    console.error('Summarize API error:', error)
    return NextResponse.json(
      { 
        summary: 'This is a sample summary. The AI summarization service is currently unavailable.'
      },
      { status: 200 }
    )
  }
} 
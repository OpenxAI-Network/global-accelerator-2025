import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
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
    
    return NextResponse.json({ 
      answer: data.response || 'I could not process your question. Please try again!' 
    })
  } catch (error) {
    console.error('Study Buddy API error:', error)
    return NextResponse.json(
      { error: 'Failed to get study buddy response' },
      { status: 500 }
    )
  }
} 
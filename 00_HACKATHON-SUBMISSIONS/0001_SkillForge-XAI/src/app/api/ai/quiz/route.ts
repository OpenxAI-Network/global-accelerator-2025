import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty, questionCount = 5 } = await request.json()

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert quiz generator for SkillForge-XAI. Generate ${questionCount} multiple choice questions about ${topic} at ${difficulty} level. 

Return ONLY a valid JSON array with this exact format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Brief explanation of why this is correct"
  }
]

Make questions educational, clear, and appropriate for the difficulty level.`
        },
        {
          role: "user",
          content: `Generate ${questionCount} ${difficulty} level multiple choice questions about ${topic}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const response = completion.choices[0]?.message?.content
    
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    let questions
    try {
      questions = JSON.parse(response)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', response)
      throw new Error('Invalid JSON response from AI')
    }

    return NextResponse.json({
      success: true,
      questions,
      topic,
      difficulty,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Quiz generation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate quiz',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
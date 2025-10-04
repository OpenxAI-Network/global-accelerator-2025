import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, userId, sessionId } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Forward to the tutor API with voice-optimized settings
    const tutorResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/tutor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId,
        sessionId,
        context: 'voice_interaction',
        learningStyle: 'conversational',
        isVoiceInput: true
      })
    })

    const data = await tutorResponse.json()

    if (!tutorResponse.ok) {
      throw new Error(data.error || 'Failed to get AI response')
    }

    // Return response optimized for voice
    return NextResponse.json({
      response: data.response,
      sessionId: data.sessionId,
      timestamp: data.timestamp,
      isVoiceOptimized: true
    })

  } catch (error) {
    console.error('Voice API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Voice service error',
        response: "I'm sorry, I'm having trouble processing your voice input right now. Please try again.",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
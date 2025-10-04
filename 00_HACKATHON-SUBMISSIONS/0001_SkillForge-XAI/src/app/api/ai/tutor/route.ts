import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Groq from 'groq-sdk'
import { createChatSession, addChatMessage } from '@/lib/database'
import { supabase } from '@/lib/supabase'

const openai = process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('placeholder') 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Determine which AI service to use
const useGroq = process.env.USE_GROQ === 'true' && process.env.GROQ_API_KEY
const useOpenAI = openai && !useGroq

// Fallback response generator when OpenAI API is unavailable
function generateFallbackResponse(message: string, subject?: string, difficulty?: string, learningStyle?: string): string {
  const responses = {
    greeting: [
      "Hello! I'm your AI tutor. While I'm currently running in demo mode, I'm here to help you learn!",
      "Hi there! Welcome to SkillForge-XAI. I'm ready to assist with your learning journey!"
    ],
    explanation: [
      `I'd be happy to explain that concept! In ${subject || 'this topic'}, the key points to understand are the fundamental principles and how they apply in practice.`,
      `Great question! Let me break this down for you step by step, keeping in mind your ${learningStyle || 'preferred'} learning style.`
    ],
    encouragement: [
      "You're asking excellent questions! Keep up the curiosity - that's the key to effective learning.",
      "I can see you're really thinking deeply about this. That's exactly the right approach!"
    ],
    general: [
      `Thanks for your question about "${message.slice(0, 50)}...". While I'm in demo mode, I encourage you to explore this topic through multiple resources and practice exercises.`,
      "I appreciate your engagement! For the best learning experience, I recommend breaking complex topics into smaller, manageable parts."
    ]
  }

  // Simple keyword matching for response type
  const lowerMessage = message.toLowerCase()
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return responses.greeting[Math.floor(Math.random() * responses.greeting.length)]
  } else if (lowerMessage.includes('explain') || lowerMessage.includes('what is') || lowerMessage.includes('how')) {
    return responses.explanation[Math.floor(Math.random() * responses.explanation.length)]
  } else if (lowerMessage.includes('good') || lowerMessage.includes('thanks')) {
    return responses.encouragement[Math.floor(Math.random() * responses.encouragement.length)]
  } else {
    return responses.general[Math.floor(Math.random() * responses.general.length)]
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, context, learningStyle, difficulty, subject, userId, sessionId, courseId, lessonId } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Verify at least one AI service is configured
    if (!useGroq && !useOpenAI) {
      return NextResponse.json(
        { error: 'No AI service configured' },
        { status: 500 }
      )
    }

    // System prompt optimized to match OpenAI's concise, focused style
    const systemPrompt = `You are an AI tutor. Provide concise, helpful responses that are:

- Direct and to the point
- Clear and easy to understand
- Focused on the specific question asked
- Educational but not overly verbose
- Professional yet approachable

Context: ${subject ? `Subject: ${subject}` : ''} ${difficulty ? `Level: ${difficulty}` : ''} ${learningStyle ? `Style: ${learningStyle}` : ''}

Keep responses under 150 words unless more detail is specifically requested.`

    // Skip database operations for demo mode
    let currentSessionId = null
    // Only use database if we have a valid UUID userId
    const isValidUserId = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)
    if (isValidUserId) {
      const isValidUUID = sessionId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)
      if (isValidUUID) {
        currentSessionId = sessionId
      } else {
        const session = await createChatSession(userId, 'general', courseId, lessonId)
        currentSessionId = session.id
      }
    }

    // Get conversation history if session exists
    let conversationHistory: any[] = []
    if (currentSessionId && isValidUserId) {
      try {
        const { data: messages } = await supabase
          .from('ai_chat_messages')
          .select('role, content')
          .eq('session_id', currentSessionId)
          .order('created_at', { ascending: true })
          .limit(10) // Last 10 messages for context
        
        if (messages) {
          conversationHistory = messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }
      } catch (error) {
        console.log('Skipping conversation history due to database error')
      }
    }

    let response: string
    let tokensUsed = 0
    let isUsingFallback = false

    try {
      let completion: any
      
      if (useGroq) {
        // Use Groq (free, fast) but present as OpenAI
        completion = await groq.chat.completions.create({
          model: "llama3-8b-8192", // Fast, free Groq model
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            ...conversationHistory,
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.3, // Lower temperature for more focused responses like OpenAI
          max_tokens: 300, // Shorter responses to match OpenAI style
          top_p: 0.9,
          stop: null,
        })
      } else if (useOpenAI) {
        // Use OpenAI
        completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            ...conversationHistory,
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 300, // Match shorter OpenAI-style responses
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      } else {
        throw new Error('No AI service configured')
      }

      response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again."
      tokensUsed = completion.usage?.total_tokens || 0
    } catch (aiError: any) {
      // Handle quota exceeded and other AI errors
      if (aiError?.status === 429 || aiError?.code === 'insufficient_quota') {
        isUsingFallback = true
        response = generateFallbackResponse(message, subject, difficulty, learningStyle)
      } else {
        throw aiError // Re-throw other errors
      }
    }

    // Save messages to database if session exists and user is valid
    if (currentSessionId && isValidUserId) {
      try {
        await addChatMessage(currentSessionId, 'user', message, { context, learningStyle, difficulty, subject })
        await addChatMessage(currentSessionId, 'assistant', response, {}, tokensUsed, useGroq ? 'llama3-8b-8192' : (process.env.OPENAI_MODEL || 'gpt-3.5-turbo'))
      } catch (error) {
        console.log('Skipping message save due to database error')
      }
    }

    // Simulate advanced AI features for demo
    const aiMetrics = {
      confidence: Math.random() * 0.3 + 0.7, // 70-100%
      engagement: Math.random() * 0.4 + 0.6, // 60-100%
      comprehension: Math.random() * 0.3 + 0.7, // 70-100%
      adaptationLevel: Math.floor(Math.random() * 5) + 1, // 1-5
      suggestedNextTopics: [
        "Advanced concepts in this area",
        "Practical applications",
        "Related interdisciplinary topics"
      ]
    }

    return NextResponse.json({ 
      response,
      sessionId: currentSessionId,
      metrics: aiMetrics,
      timestamp: new Date().toISOString(),
      model: isUsingFallback ? "fallback-tutor" : (useGroq ? "llama3-8b-8192" : (process.env.OPENAI_MODEL || "gpt-3.5-turbo")),
      tokensUsed,
      isUsingFallback,
      hackathon: "OpenxAI Global Accelerator 2025"
    })
  } catch (error) {
    console.error('AI Tutor error:', error)
    
    // If it's a quota error, provide a helpful message
    if (error instanceof Error && (error.message.includes('429') || error.message.includes('quota'))) {
      return NextResponse.json(
        { 
          error: 'OpenAI API quota exceeded',
          message: 'The OpenAI API quota has been exceeded. Please check your billing details or try again later.',
          fallbackAvailable: true,
          timestamp: new Date().toISOString()
        },
        { status: 429 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'AI Tutor service error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
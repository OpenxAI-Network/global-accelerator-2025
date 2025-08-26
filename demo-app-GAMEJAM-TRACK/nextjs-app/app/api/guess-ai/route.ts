import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Generate AI sentence using Ollama
    const aiResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: 'Write a single sentence about technology or programming that sounds natural but could be written by AI. Keep it concise and engaging.',
        stream: false,
      }),
    })

    if (!aiResponse.ok) {
      throw new Error('Failed to get AI response')
    }

    const aiData = await aiResponse.json()
    const aiSentence = aiData.response || 'Artificial intelligence is transforming the way we interact with technology.'

    // Human-written sentences (curated examples)
    const humanSentences = [
      "I spent three hours debugging that CSS issue yesterday and it turned out to be a missing semicolon.",
      "My cat knocked over my coffee cup right onto my laptop keyboard this morning.",
      "The weather is absolutely perfect for a weekend hike in the mountains.",
      "I can't believe how expensive groceries have gotten lately.",
      "That movie was so much better than I expected - the plot twists were incredible!",
      "I need to remember to pick up my dry cleaning before they close at 6pm.",
      "The new restaurant downtown has the best pizza I've ever tasted.",
      "My neighbor's dog barks every time someone walks past their house.",
      "I'm thinking of repainting my bedroom this weekend - maybe a light blue?",
      "The traffic on the way to work this morning was absolutely terrible."
    ]

    const humanSentence = humanSentences[Math.floor(Math.random() * humanSentences.length)]

    return NextResponse.json({
      aiSentence: aiSentence.trim(),
      humanSentence: humanSentence,
      correctAnswer: 'ai' // First sentence is always AI
    })
  } catch (error) {
    console.error('Guess AI API error:', error)
    return NextResponse.json(
      { 
        aiSentence: 'Machine learning algorithms can process vast amounts of data to identify patterns and make predictions.',
        humanSentence: 'I spent three hours debugging that CSS issue yesterday and it turned out to be a missing semicolon.',
        correctAnswer: 'ai'
      },
      { status: 200 }
    )
  }
} 
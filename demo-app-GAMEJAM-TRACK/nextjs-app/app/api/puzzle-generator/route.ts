import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Generate puzzle using Ollama
    const puzzleResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: `Create a fun and engaging puzzle with the following format:
Question: [An interesting riddle, word puzzle, or logic problem]
Answer: [The correct answer - single word or short phrase]
Hint: [A helpful hint that doesn't give away the answer]

Make it creative and suitable for all ages. The question should be engaging and the answer should be a single word or short phrase.`,
        stream: false,
      }),
    })

    if (!puzzleResponse.ok) {
      throw new Error('Failed to get puzzle response')
    }

    const puzzleData = await puzzleResponse.json()
    const puzzleText = puzzleData.response || ''

    // Parse the response to extract question, answer, and hint
    const lines = puzzleText.split('\n').filter((line: string) => line.trim())
    let question = ''
    let answer = ''
    let hint = ''

    for (const line of lines) {
      if (line.toLowerCase().includes('question:')) {
        question = line.replace(/question:\s*/i, '').trim()
      } else if (line.toLowerCase().includes('answer:')) {
        answer = line.replace(/answer:\s*/i, '').trim()
      } else if (line.toLowerCase().includes('hint:')) {
        hint = line.replace(/hint:\s*/i, '').trim()
      }
    }

    // Fallback puzzle if parsing fails
    if (!question || !answer) {
      question = "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?"
      answer = "echo"
      hint = "Think about what happens when you shout in a canyon or empty room."
    }

    const puzzle = {
      id: Date.now().toString(),
      question: question,
      answer: answer,
      hint: hint
    }

    return NextResponse.json({ puzzle })
  } catch (error) {
    console.error('Puzzle generator API error:', error)
    
    // Fallback puzzle
    const fallbackPuzzle = {
      id: Date.now().toString(),
      question: "What has keys, but no locks; space, but no room; and you can enter, but not go in?",
      answer: "keyboard",
      hint: "You use this every day to communicate with your computer."
    }
    
    return NextResponse.json({ puzzle: fallbackPuzzle }, { status: 200 })
  }
} 
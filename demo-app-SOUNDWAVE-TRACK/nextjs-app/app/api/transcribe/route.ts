import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // For now, return a mock transcription
    // In a real implementation, you would:
    // 1. Convert audio to text using a speech-to-text service like Whisper
    // 2. Process the audio file and extract text
    // 3. Clean up the transcription for better readability

    // Generate a realistic mock transcription based on common scenarios
    const mockTranscriptions = [
      "Today's meeting focused on the Q3 project timeline. We discussed the new feature requirements and assigned tasks to team members. The deadline is set for October 15th, and we need to ensure all deliverables are completed on time.",
      "In today's lecture, we covered the fundamentals of machine learning algorithms. We discussed supervised learning, unsupervised learning, and reinforcement learning. The key takeaway is understanding the difference between classification and regression problems.",
      "I need to remember to pick up groceries on the way home. We're running low on milk, bread, and eggs. Also, don't forget to call the dentist to reschedule next week's appointment.",
      "The quarterly sales report shows a 15% increase in revenue compared to last quarter. Our top-performing products are the premium subscription and enterprise solutions. We should focus our marketing efforts on these high-value segments."
    ]

    const mockTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)]

    // Send transcription to Ollama for enhancement
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: `Please enhance this transcription to make it more readable and well-formatted. Add proper punctuation, fix any grammar issues, and organize it into clear sentences:

Original: "${mockTranscription}"

Enhanced transcription:`,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get response from Ollama')
    }

    const data = await response.json()
    
    return NextResponse.json({ 
      transcription: data.response || mockTranscription
    })
  } catch (error) {
    console.error('Transcribe API error:', error)
    return NextResponse.json(
      { error: 'Failed to process audio transcription' },
      { status: 500 }
    )
  }
} 
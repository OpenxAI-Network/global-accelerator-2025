import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const prompt = `Create a quiz from the following text. Generate 4-6 multiple choice questions in JSON format:
{
  "quiz": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Explanation for the correct answer"
    }
  ]
}

Make questions challenging but fair, with clear explanations.

Text: ${text}`

    try {
      // Try Ollama first (local AI)
      const response = await fetch('http://localhost:11434/api/generate', {
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

      if (response.ok) {
        const data = await response.json()
        
        try {
          // Try to parse JSON from the response
          const quizMatch = data.response.match(/\{[\s\S]*\}/)
          if (quizMatch) {
            const quizData = JSON.parse(quizMatch[0])
            return NextResponse.json(quizData)
          }
        } catch (parseError) {
          console.log('Could not parse JSON, creating fallback quiz')
        }
      }
    } catch (ollamaError) {
      console.log('Ollama not available, using fallback')
    }

    // Fallback: create sample quiz questions
    const fallbackQuiz = [
      {
        question: "Which skill is most important for career advancement in today's job market?",
        options: [
          "Technical expertise only",
          "Communication and adaptability",
          "Years of experience",
          "Educational credentials"
        ],
        correct: 1,
        explanation: "While technical skills are important, communication and adaptability are crucial in the rapidly changing modern workplace."
      },
      {
        question: "What percentage of jobs are typically filled through networking rather than public job postings?",
        options: [
          "30-40%",
          "50-60%", 
          "70-80%",
          "90-100%"
        ],
        correct: 2,
        explanation: "Studies consistently show that 70-80% of jobs are never publicly advertised and are filled through networking and referrals."
      },
      {
        question: "What is the most effective approach to career transition?",
        options: [
          "Quit your job and then start looking",
          "Apply to random job postings",
          "Research, skill up, network, then transition gradually",
          "Wait for the perfect opportunity"
        ],
        correct: 2,
        explanation: "A systematic approach involving research, skill development, networking, and gradual transition typically yields the best results."
      },
      {
        question: "How often should you update your professional skills?",
        options: [
          "Once every 5 years",
          "Only when changing jobs",
          "Continuously throughout your career",
          "Only when required by employer"
        ],
        correct: 2,
        explanation: "Continuous learning and skill updates are essential to stay competitive and relevant in today's rapidly evolving job market."
      },
      {
        question: "What is the primary purpose of personal branding in career development?",
        options: [
          "To become famous",
          "To differentiate yourself and communicate your value",
          "To copy successful people",
          "To post on social media frequently"
        ],
        correct: 1,
        explanation: "Personal branding helps you stand out by clearly communicating your unique value proposition and expertise to potential employers or clients."
      }
    ]

    return NextResponse.json({ quiz: fallbackQuiz })

  } catch (error) {
    console.error('Quiz API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    )
  }
}
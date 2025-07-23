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

    const prompt = `You are an expert quiz creator and educator. Create a high-quality multiple choice quiz from the following text that effectively tests comprehension and critical thinking.

INSTRUCTIONS:
- Generate exactly 5-6 well-crafted multiple choice questions
- Test different cognitive levels: recall, comprehension, application, analysis
- Create 4 options per question with plausible, challenging distractors
- Make incorrect options believable but clearly wrong to knowledgeable students
- Vary question difficulty from basic to advanced
- Include detailed explanations that teach why the answer is correct
- Focus on the most important concepts and key details

QUESTION QUALITY GUIDELINES:
- Questions should be clear, specific, and unambiguous
- Avoid "all of the above" or "none of the above" options
- Make distractors relate to the topic but be factually incorrect
- Test understanding, not just memorization

OUTPUT FORMAT (JSON only, no other text):
{
  "quiz": [
    {
      "question": "Clear, specific question testing comprehension?",
      "options": ["Correct answer", "Plausible distractor", "Related but wrong", "Believable incorrect option"],
      "correct": 0,
      "explanation": "Detailed explanation of why this answer is correct and why others are wrong"
    }
  ]
}

SOURCE MATERIAL:
${text}

Generate the JSON now:`

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
    
    try {
      // Try to parse JSON from the response - look for the quiz array specifically
      const response = data.response.trim()
      
      // First try: Complete JSON object
      const fullJsonMatch = response.match(/\{[\s\S]*"quiz"[\s\S]*\}/)
      if (fullJsonMatch) {
        const jsonStr = fullJsonMatch[0]
        const quizData = JSON.parse(jsonStr)
        if (quizData.quiz && Array.isArray(quizData.quiz)) {
          return NextResponse.json(quizData)
        }
      }
      
      // Second try: Extract just the quiz array
      const arrayMatch = response.match(/"quiz":\s*\[([\s\S]*?)\]/)
      if (arrayMatch) {
        const arrayContent = arrayMatch[1]
        const quizArray = JSON.parse(`[${arrayContent}]`)
        return NextResponse.json({ quiz: quizArray })
      }
    } catch (parseError) {
      console.log('Quiz JSON parsing failed:', parseError.message)
    }

    // Fallback: create a simple quiz structure
    return NextResponse.json({
      quiz: [
        {
          question: "What is the main topic of the provided text?",
          options: ["Topic A", "Topic B", "Topic C", "Topic D"],
          correct: 0,
          explanation: data.response || 'Generated from your text'
        }
      ]
    })
  } catch (error) {
    console.error('Quiz API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    )
  }
} 
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

    const prompt = `You are a helpful study buddy and career mentor. Provide clear, educational explanations that help students understand career-related concepts better. Break down complex topics into simple terms, provide examples, and encourage learning.
, Dont give large answers , give answers less than 400 to 500 lines
Student Question: ${question}

Study Buddy Response:`

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
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 300
          }
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({ answer: data.response })
      }
    } catch (ollamaError) {
      console.log('Ollama not available, using fallback response')
    }

    // Fallback responses based on common career questions
    const fallbackResponses = {
      'skills': "Great question about skills! The most important skills for career growth typically fall into three categories: 1) **Technical skills** specific to your field, 2) **Soft skills** like communication and leadership, and 3) **Adaptability** to learn new technologies. Focus on developing a combination of all three. What specific area would you like to explore further?",
      
      'interview': "Interview preparation is crucial! Here's my advice: 1) **Research the company** thoroughly - their mission, values, recent news, 2) **Practice common questions** using the STAR method (Situation, Task, Action, Result), 3) **Prepare thoughtful questions** to ask them, 4) **Do mock interviews** with friends or family. Remember, interviews are conversations, not interrogations. You've got this!",
      
      'networking': "Networking doesn't have to be scary! Start with these steps: 1) **Join professional groups** in your industry, 2) **Attend online events** and webinars, 3) **Connect with colleagues** on LinkedIn, 4) **Offer help first** before asking for favors, 5) **Follow up consistently**. Remember, networking is about building genuine relationships, not just collecting contacts.",
      
      'resume': "A great resume tells your professional story! Key tips: 1) **Tailor each resume** to the specific job, 2) **Use action verbs** and quantify achievements, 3) **Keep it concise** (1-2 pages max), 4) **Include relevant keywords** from the job description, 5) **Proofread carefully**. Focus on accomplishments, not just duties. What specific aspect would you like help with?",
      
      'career change': "Career transitions can be exciting! Here's a roadmap: 1) **Self-assessment** - identify your values, interests, and transferable skills, 2) **Research thoroughly** - understand the new field's requirements, 3) **Build bridges** - find connections between your current and target careers, 4) **Develop new skills** gradually, 5) **Network strategically** in your target industry. Take it step by step!",
      
      'salary': "Salary negotiations require preparation! Steps: 1) **Research market rates** using sites like Glassdoor, PayScale, 2) **Document your achievements** and value-add, 3) **Practice your pitch**, 4) **Consider the total package** (benefits, growth opportunities), 5) **Be collaborative, not confrontational**. Remember, timing matters - usually best after receiving an offer.",
      
      'default': "That's a thoughtful question! Career development is a journey that requires continuous learning and adaptation. Here are some general principles that apply to most career situations: 1) **Stay curious** and keep learning, 2) **Build meaningful relationships**, 3) **Seek feedback regularly**, 4) **Take calculated risks**, 5) **Maintain work-life balance**. Could you provide more specific details so I can give you more targeted advice?"
    }

    // Simple keyword matching for fallback response
    const lowerQuestion = question.toLowerCase()
    let response = fallbackResponses.default

    if (lowerQuestion.includes('skill') || lowerQuestion.includes('ability')) {
      response = fallbackResponses.skills
    } else if (lowerQuestion.includes('interview')) {
      response = fallbackResponses.interview
    } else if (lowerQuestion.includes('network') || lowerQuestion.includes('connect')) {
      response = fallbackResponses.networking
    } else if (lowerQuestion.includes('resume') || lowerQuestion.includes('cv')) {
      response = fallbackResponses.resume
    } else if (lowerQuestion.includes('career change') || lowerQuestion.includes('transition')) {
      response = fallbackResponses['career change']
    } else if (lowerQuestion.includes('salary') || lowerQuestion.includes('negotiate') || lowerQuestion.includes('pay')) {
      response = fallbackResponses.salary
    }

    return NextResponse.json({ answer: response })

  } catch (error) {
    console.error('Study buddy API error:', error)
    return NextResponse.json(
      { error: 'Failed to get study help' },
      { status: 500 }
    )
  }
}
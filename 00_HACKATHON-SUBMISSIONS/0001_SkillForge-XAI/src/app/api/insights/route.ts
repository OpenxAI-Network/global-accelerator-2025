import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Groq from 'groq-sdk'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const useGroq = process.env.USE_GROQ === 'true' && process.env.GROQ_API_KEY
const useOpenAI = process.env.OPENAI_API_KEY && !useGroq

export async function POST(request: NextRequest) {
  try {
    const { userId, learningData, requestType = 'general' } = await request.json()

    // Mock learning data if not provided
    const mockLearningData = {
      totalHours: 47.5,
      completedCourses: 8,
      currentStreak: 12,
      averageScore: 87.3,
      recentTopics: ['JavaScript', 'React', 'Data Structures', 'Algorithms'],
      weakAreas: ['Time Complexity', 'Testing', 'Documentation'],
      strongAreas: ['Problem Solving', 'Debugging', 'Code Structure'],
      learningStyle: 'Visual and Hands-on',
      goals: ['Full-stack Development', 'Open Source Contribution']
    }

    const dataToAnalyze = learningData || mockLearningData

    let insights: string
    
    try {
      const systemPrompt = `You are an AI learning analytics expert. Analyze the provided learning data and generate personalized insights and recommendations.

Learning Data: ${JSON.stringify(dataToAnalyze, null, 2)}

Provide insights in the following JSON format:
{
  "summary": "Brief overview of learning progress",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvementAreas": ["area1", "area2", "area3"],
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed description",
      "priority": "high|medium|low",
      "category": "Category name",
      "estimatedTime": "Time to complete"
    }
  ],
  "nextGoals": ["goal1", "goal2", "goal3"],
  "motivationalMessage": "Encouraging message for the learner"
}

Make recommendations specific, actionable, and personalized based on the data.`

      let completion: any

      if (useGroq) {
        completion = await groq.chat.completions.create({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate insights for request type: ${requestType}` }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        })
      } else if (useOpenAI) {
        completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate insights for request type: ${requestType}` }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        })
      } else {
        throw new Error('No AI service configured')
      }

      insights = completion.choices[0]?.message?.content || ""
      
      // Try to parse as JSON, fallback to structured response if parsing fails
      let parsedInsights
      try {
        parsedInsights = JSON.parse(insights)
      } catch (parseError) {
        // Fallback structured response
        parsedInsights = {
          summary: "Based on your learning data, you're making excellent progress with consistent daily practice and strong problem-solving skills.",
          strengths: [
            "Consistent daily learning habit",
            "Strong problem-solving approach", 
            "Quick grasp of new concepts",
            "Active engagement with material"
          ],
          improvementAreas: [
            "Time management during complex problems",
            "Code documentation practices",
            "Testing methodologies",
            "Algorithm optimization"
          ],
          recommendations: [
            {
              title: "Focus on Advanced JavaScript Concepts",
              description: "Based on your recent performance, diving deeper into closures and async programming would strengthen your foundation.",
              priority: "high",
              category: "Programming",
              estimatedTime: "2-3 weeks"
            },
            {
              title: "Practice Data Structures Daily",
              description: "Consistent practice with arrays and objects will improve your problem-solving speed by 40%.",
              priority: "high", 
              category: "Computer Science",
              estimatedTime: "1 month"
            },
            {
              title: "Explore React Hooks",
              description: "Your JavaScript skills are strong enough to tackle advanced React patterns.",
              priority: "medium",
              category: "Web Development", 
              estimatedTime: "2 weeks"
            }
          ],
          nextGoals: [
            "Complete Advanced JavaScript course",
            "Build a full-stack project",
            "Contribute to open source",
            "Master React ecosystem"
          ],
          motivationalMessage: "You're on an excellent learning trajectory! Your consistency and curiosity are your greatest assets. Keep pushing forward!"
        }
      }

      return NextResponse.json({
        insights: parsedInsights,
        generatedAt: new Date().toISOString(),
        userId,
        requestType,
        success: true
      })

    } catch (aiError: any) {
      console.error('AI service error:', aiError)
      
      // Fallback insights when AI is unavailable
      const fallbackInsights = {
        summary: "Your learning journey shows great potential! While our AI analysis is temporarily unavailable, here are some general insights based on typical learning patterns.",
        strengths: [
          "Dedication to continuous learning",
          "Willingness to tackle new challenges",
          "Consistent practice approach",
          "Growth mindset"
        ],
        improvementAreas: [
          "Time management optimization",
          "Regular progress review",
          "Skill application practice",
          "Knowledge retention techniques"
        ],
        recommendations: [
          {
            title: "Establish Daily Learning Routine",
            description: "Set aside dedicated time each day for focused learning to build momentum.",
            priority: "high",
            category: "Study Habits",
            estimatedTime: "1 week to establish"
          },
          {
            title: "Practice Active Recall",
            description: "Test yourself regularly on learned concepts to improve retention.",
            priority: "medium",
            category: "Learning Techniques",
            estimatedTime: "Ongoing"
          },
          {
            title: "Build Projects",
            description: "Apply your knowledge through hands-on projects to reinforce learning.",
            priority: "high",
            category: "Practical Application",
            estimatedTime: "2-4 weeks per project"
          }
        ],
        nextGoals: [
          "Define specific learning objectives",
          "Create a structured study plan",
          "Join learning communities",
          "Track progress regularly"
        ],
        motivationalMessage: "Every expert was once a beginner. Your commitment to learning is the first step toward mastery!"
      }

      return NextResponse.json({
        insights: fallbackInsights,
        generatedAt: new Date().toISOString(),
        userId,
        requestType,
        success: true,
        fallback: true
      })
    }

  } catch (error) {
    console.error('Insights API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate insights',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
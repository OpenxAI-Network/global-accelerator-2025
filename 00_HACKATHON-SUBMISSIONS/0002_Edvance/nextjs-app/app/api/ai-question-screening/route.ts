import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simple semantic similarity function
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/).filter(word => word.length > 2)
  const words2 = text2.toLowerCase().split(/\s+/).filter(word => word.length > 2)
  
  const intersection = words1.filter(word => words2.includes(word))
  const union = Array.from(new Set([...words1, ...words2]))
  
  return intersection.length / union.length
}

// Function to extract specific information from document content
function extractSpecificInfo(question: string, documentContent: string): string | null {
  const lowerQuestion = question.toLowerCase()
  
  // Extract final exam weighting specifically
  if (lowerQuestion.includes("weighting") && lowerQuestion.includes("final exam")) {
    const finalExamWeightingMatch = documentContent.match(/Final Exam[\s\S]*?Weighting:\s*([^\n]+)/i)
    if (finalExamWeightingMatch) {
      return finalExamWeightingMatch[1].trim()
    }
  }
  
  // Extract final exam due date specifically
  if ((lowerQuestion.includes("final exam") || lowerQuestion.includes("exam date")) && !lowerQuestion.includes("weighting")) {
    const finalExamDueMatch = documentContent.match(/Final Exam[\s\S]*?Due Date:\s*([^\n]+)/i)
    if (finalExamDueMatch) {
      return finalExamDueMatch[1].trim()
    }
  }
  
  // Extract general weighting information (for other assessments)
  if (lowerQuestion.includes("weighting") && !lowerQuestion.includes("final exam")) {
    // Look for specific assessment types in the question
    if (lowerQuestion.includes("group assignment") || lowerQuestion.includes("group")) {
      const groupAssignmentMatch = documentContent.match(/Group Assignment[\s\S]*?Weighting:\s*([^\n]+)/i)
      if (groupAssignmentMatch) {
        return groupAssignmentMatch[1].trim()
      }
    } else if (lowerQuestion.includes("early feedback") || lowerQuestion.includes("feedback")) {
      const earlyFeedbackMatch = documentContent.match(/Early Feedback[\s\S]*?Weighting:\s*([^\n]+)/i)
      if (earlyFeedbackMatch) {
        return earlyFeedbackMatch[1].trim()
      }
    } else {
      // Fallback to general weighting match
      const weightingMatch = documentContent.match(/Weighting:\s*([^\n]+)/i)
      if (weightingMatch) {
        return weightingMatch[1].trim()
      }
    }
  }
  
  // Extract due date information (for non-final exam items)
  if (lowerQuestion.includes("due date") || lowerQuestion.includes("due")) {
    const dueDateMatch = documentContent.match(/Due Date:\s*([^\n]+)/i)
    if (dueDateMatch) {
      return dueDateMatch[1].trim()
    }
  }
  
  // Extract requirements information
  if (lowerQuestion.includes("requirements") || lowerQuestion.includes("require")) {
    if (lowerQuestion.includes("group assignment") || lowerQuestion.includes("group")) {
      const groupRequirementsMatch = documentContent.match(/Group Assignment[\s\S]*?Requirements?:\s*([^\n]+)/i)
      if (groupRequirementsMatch) {
        return groupRequirementsMatch[1].trim()
      }
    }
  }
  
  // Extract release date information
  if (lowerQuestion.includes("release date") || lowerQuestion.includes("release")) {
    const releaseDateMatch = documentContent.match(/Release Date:\s*([^\n]+)/i)
    if (releaseDateMatch) {
      return releaseDateMatch[1].trim()
    }
  }
  
  return null
}

// Search documents for relevant content
async function searchDocuments(query: string, classId: string): Promise<{ document: any; similarity: number; excerpt: string }[]> {
  try {
    const documents = await prisma.document.findMany({
      where: { classId },
      include: { uploader: true }
    })
    
    const results = documents.map(doc => {
      const similarity = calculateSimilarity(query, doc.content)
      return {
        document: doc,
        similarity,
        excerpt: doc.content.substring(0, 300) + (doc.content.length > 300 ? '...' : '')
      }
    })
    
    return results.filter(result => result.similarity > 0.01).sort((a, b) => b.similarity - a.similarity)
  } catch (error) {
    console.error('Error searching documents:', error)
    return []
  }
}

// Search past Q&A for similar questions
async function searchPastQA(query: string, classId: string): Promise<{ question: any; similarity: number }[]> {
  try {
    const questions = await prisma.question.findMany({
      where: { classId },
      include: {
        answers: { include: { author: true } },
        author: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    
    const results = questions.map(q => {
      const questionText = q.title + ' ' + q.content
      const similarity = calculateSimilarity(query, questionText)
      return {
        question: q,
        similarity
      }
    })
    
    return results.filter(result => result.similarity > 0.1).sort((a, b) => b.similarity - a.similarity)
  } catch (error) {
    console.error('Error searching past Q&A:', error)
    return []
  }
}

async function analyzeQuestionWithAI(question: string, knowledgeBase: any, className: string, documentResults: any[], qaResults: any[]) {
  try {
    console.log('Starting AI analysis for question:', question)
    
    // Try direct extraction first
    for (const docResult of documentResults) {
      const extracted = extractSpecificInfo(question, docResult.document.content)
      if (extracted) {
        console.log('Direct extraction found:', extracted)
        
        // Format the answer based on the question type
        let formattedAnswer = extracted
        const lowerQuestion = question.toLowerCase()
        
        if (lowerQuestion.includes('weighting') && lowerQuestion.includes('final exam')) {
          formattedAnswer = `The final exam weighting is ${extracted}`
        } else if (lowerQuestion.includes('weighting') && !lowerQuestion.includes('final exam')) {
          formattedAnswer = `The weighting is ${extracted}`
        } else if (lowerQuestion.includes('requirements') || lowerQuestion.includes('require')) {
          formattedAnswer = `The requirements are: ${extracted}`
        } else if (lowerQuestion.includes('due date') || lowerQuestion.includes('due')) {
          formattedAnswer = `The due date is ${extracted}`
        } else if (lowerQuestion.includes('release date') || lowerQuestion.includes('release')) {
          formattedAnswer = `The release date is ${extracted}`
        } else if (lowerQuestion.includes('final exam') || lowerQuestion.includes('exam date')) {
          formattedAnswer = `The final exam period starts ${extracted}`
        }
        
        return {
          canAnswer: true,
          confidence: 95,
          answer: formattedAnswer,
          sources: [
            {
              type: "document",
              title: docResult.document.title,
              relevance: "Contains the specific information requested",
              filename: docResult.document.filename
            }
          ],
          similarQuestions: [],
          shouldPostToForum: false,
          reasoning: "Found specific information using direct extraction"
        }
      }
    }
    
    // If direct extraction fails, use AI with strict prompt
    const prompt = `You are a precise university assistant. Answer ONLY the specific question asked.

**QUESTION:** "${question}"

**MATERIALS:**
COURSE DOCUMENTS:
${knowledgeBase.documents.map((doc: any, index: number) => 
  `${index + 1}. ${doc.title} (${doc.type}) - Relevance: ${Math.round(doc.similarity * 100)}%\n${doc.content}`
).join('\n\n')}

PREVIOUS Q&A DISCUSSIONS:
${knowledgeBase.previousQA.map((qa: any, index: number) => 
  `${index + 1}. Q: ${qa.question} - Relevance: ${Math.round(qa.similarity * 100)}%\n   A: ${qa.answers.join(' | ')}`
).join('\n\n')}

**CRITICAL RULES:**
1. Answer ONLY what was asked - be specific and direct
2. Use ONLY information that is EXPLICITLY stated in the materials above
3. NO assumptions, interpretations, or additional information
4. NO "Based on" or similar phrases
5. NO source citations in the answer text (sources are provided separately)
6. If information is not explicitly in the materials, say "This information is not provided in the available course materials"
7. If asked about weighting, give ONLY the weighting percentage/value
8. If asked about due date, give ONLY the due date
9. Do NOT mix different types of information in your answer
10. If asked about requirements, give ONLY the requirements for that specific item
11. NEVER include information about other assessments unless specifically asked
12. Keep answers concise and focused on the exact question

**EXAMPLES:**
- Q: "What is the weighting for the early feedback task?" → A: "The weighting is 5%."
- Q: "What is the weighting of the final exam?" → A: "The final exam weighting is 50%."
- Q: "When is the early feedback task due?" → A: "The due date is Week 3 – 17 Mar 2025."
- Q: "When does the final exam period start?" → A: "The final exam period starts 16 Jun 2025."
- Q: "What are the requirements for the group assignment?" → A: "The group assignment requires an investment portfolio recommendation with maximum 2,500 words up to 10 pages including appendices."

**CRITICAL:** Look carefully through the materials and answer the EXACT question asked. If they ask for weighting, give ONLY the weighting. If they ask for due date, give ONLY the due date. Do not mix information types.

RESPONSE FORMAT (JSON):
{
  "canAnswer": true,
  "confidence": 95,
  "answer": "[Specific answer to the question asked]",
  "sources": [
    {
      "type": "document",
      "title": "[Document Title]",
      "relevance": "Contains the specific information requested"
    }
  ],
  "similarQuestions": [],
  "shouldPostToForum": false,
  "reasoning": "Found specific information in course materials"
}

CRITICAL: You must respond with ONLY valid JSON. No additional text before or after the JSON.`

    console.log('Calling Ollama API...')
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: prompt,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const data = await response.json()
    const aiText = data.response
    console.log('Raw AI response:', aiText.substring(0, 500) + '...')

    // Parse AI response
    let aiAnalysis
    try {
      // First, try to parse the entire response as JSON (in case it's wrapped in quotes)
      let jsonText = aiText.trim()
      
      // If the response starts and ends with quotes, remove them
      if (jsonText.startsWith('"') && jsonText.endsWith('"')) {
        jsonText = jsonText.slice(1, -1)
        // Unescape the inner JSON
        jsonText = jsonText.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
      }
      
      // Try to find JSON object in the text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        // Clean up the JSON text to fix common issues
        let cleanJson = jsonMatch[0]
        
        // Fix newlines in string values
        cleanJson = cleanJson.replace(/"([^"]*)\n([^"]*)"/g, '"$1 $2"')
        
        // Fix trailing commas
        cleanJson = cleanJson.replace(/,(\s*[}\]])/g, '$1')
        
        try {
          aiAnalysis = JSON.parse(cleanJson)
        } catch (innerError) {
          // If still fails, try to extract just the essential fields
          const answerMatch = cleanJson.match(/"answer":\s*"([^"]+)"/)
          const canAnswerMatch = cleanJson.match(/"canAnswer":\s*(true|false)/)
          const confidenceMatch = cleanJson.match(/"confidence":\s*(\d+)/)
          
          if (answerMatch && canAnswerMatch) {
            aiAnalysis = {
              canAnswer: canAnswerMatch[1] === 'true',
              confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 95,
              answer: answerMatch[1].replace(/\n/g, ' ').trim(),
              sources: [],
              similarQuestions: [],
              shouldPostToForum: false,
              reasoning: 'Extracted from malformed JSON'
            }
          } else {
            throw innerError
          }
        }
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError)
      console.log('Raw response:', aiText)
      
      // Fallback: create a simple response
      aiAnalysis = {
        canAnswer: false,
        confidence: 0,
        answer: '',
        sources: [],
        similarQuestions: [],
        shouldPostToForum: true,
        reasoning: 'Failed to parse AI response'
      }
    }

    return aiAnalysis

  } catch (error) {
    console.error('Error in AI analysis:', error)
    return {
      canAnswer: false,
      confidence: 0,
      answer: '',
      sources: [],
      similarQuestions: [],
      shouldPostToForum: true,
      reasoning: 'Error during AI analysis'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question, classId, userId } = await request.json()
    
    if (!question || !classId) {
      return NextResponse.json({ 
        error: 'Missing question or classId' 
      }, { status: 400 })
    }

    console.log('AI Question Screening - Question:', question, 'ClassId:', classId)

    // Get class information
    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
      select: { name: true, code: true }
    })

    if (!classInfo) {
      return NextResponse.json({ 
        error: 'Class not found' 
      }, { status: 404 })
    }

    // Search for relevant documents and past Q&A
    const [documentResults, qaResults] = await Promise.all([
      searchDocuments(question, classId),
      searchPastQA(question, classId)
    ])

    console.log(`Found ${documentResults.length} relevant documents and ${qaResults.length} relevant Q&A`)

    // Prepare knowledge base for AI analysis
    const knowledgeBase = {
      documents: documentResults.map(r => ({
        title: r.document.title,
        type: r.document.documentType,
        content: r.document.content,
        similarity: r.similarity
      })),
      previousQA: qaResults.map(r => ({
        question: r.question.title + ' ' + r.question.content,
        answers: r.question.answers.map((a: any) => a.content),
        similarity: r.similarity
      }))
    }

    // Analyze with AI
    const aiAnalysis = await analyzeQuestionWithAI(question, knowledgeBase, classInfo.name, documentResults, qaResults)

    // Add filename to sources if they're documents
    if (aiAnalysis.sources && aiAnalysis.sources.length > 0) {
      aiAnalysis.sources = aiAnalysis.sources.map((source: any) => {
        if (source.type === 'document') {
          // Find the corresponding document to get the filename
          const docResult = documentResults.find(doc => doc.document.title === source.title)
          if (docResult) {
            return {
              ...source,
              filename: docResult.document.filename
            }
          }
        }
        return source
      })
    }

    return NextResponse.json({
      success: true,
      ...aiAnalysis
    })

  } catch (error) {
    console.error('Error in AI question screening:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

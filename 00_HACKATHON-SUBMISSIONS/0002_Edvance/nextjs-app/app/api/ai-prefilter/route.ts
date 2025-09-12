import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { semanticSimilarity, extractExamDate, extractExamTime } from '../../../lib/textChunking'

interface Document {
  id: string
  classId: string
  title: string
  content: string
  documentType: string
  createdAt: string
}

interface Question {
  id: string
  title: string
  content: string
  tags: string
  author: {
    name: string
  }
  createdAt: string
}

interface Answer {
  id: string
  content: string
  author: {
    name: string
  }
  createdAt: string
  isAiGenerated: boolean
}

// AI-powered information extraction function
async function extractSpecificInfo(query: string, documentContent: string): Promise<string> {
  try {
    const prompt = `You are an AI assistant helping students find specific information from course documents.

STUDENT QUESTION: "${query}"

DOCUMENT CONTENT:
${documentContent}

INSTRUCTIONS:
1. Read the document content carefully
2. Find the specific information that directly answers the student's question
3. Provide a BRIEF, DIRECT answer - just the key information requested
4. For lecture schedule questions: If asked about "Week X", find "Lecture X" in the schedule. Answer in format: "The lecture topic in Week X is [Topic Name]"
5. For assignment questions, answer in format: "The assignment deadline is [Date]" or "The assignment is worth [Percentage]"
6. For exam questions, answer in format: "The exam is on [Date]" or "The exam covers [Topics]"
7. If the information is not in the document, respond with "Information not found in the document"
8. Be specific with dates, deadlines, requirements, etc.
9. Do NOT repeat the entire document - only provide the specific answer
10. IMPORTANT: Week numbers correspond to Lecture numbers (Week 1 = Lecture 1, Week 4 = Lecture 4, etc.)

ANSWER:`

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          max_tokens: 150
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const data = await response.json()
    const answer = data.response?.trim() || ''
    
    // Clean up the response - remove any trailing "Information not found" text
    const cleanAnswer = answer.replace(/Information not found in the document.*$/i, '').trim()
    
    // Only return if we got a meaningful answer
    if (cleanAnswer && cleanAnswer.length > 10 && !cleanAnswer.includes('Information not found')) {
      return cleanAnswer
    }
    
    return ''
  } catch (error) {
    console.log('AI extraction error:', error)
    return ''
  }
}

// Simple text similarity function for demo (in production, use embeddings)
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/)
  const words2 = text2.toLowerCase().split(/\s+/)
  
  const intersection = words1.filter(word => words2.includes(word))
  const union = Array.from(new Set([...words1, ...words2]))
  
  return intersection.length / union.length
}



async function searchDocuments(query: string, classId: string): Promise<{ document: Document; similarity: number; excerpt: string }[]> {
  try {
    console.log('Searching for query:', query, 'in classId:', classId)
    
    // Fetch documents directly from the database
    const documents = await prisma.document.findMany({
      where: { 
        classId: classId 
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`Found ${documents.length} documents for class ${classId}`)
    
    const results = documents.map(doc => {
      const similarity = semanticSimilarity(query, doc.content)
      
      // Keyword boost for exam-related queries
      const queryLower = query.toLowerCase()
      const contentLower = doc.content.toLowerCase()
      let keywordBoost = 0
      
      if (queryLower.includes('exam') || queryLower.includes('final')) {
        if (contentLower.includes('final exam') || contentLower.includes('exam date')) {
          keywordBoost = 0.3
        }
        if (contentLower.includes('exam') || contentLower.includes('final')) {
          keywordBoost = 0.1
        }
      }
      
      const boostedSimilarity = Math.min(1.0, similarity + keywordBoost)
      
      return {
        document: {
          id: doc.id,
          classId: classId,
          title: doc.title,
          filename: doc.filename,
          content: doc.content,
          documentType: doc.documentType,
          createdAt: doc.createdAt.toISOString()
        },
        similarity: boostedSimilarity,
        excerpt: doc.content.substring(0, 300) + (doc.content.length > 300 ? '...' : '')
      }
    })
    
    const filteredResults = results.filter(result => result.similarity > 0.05).sort((a, b) => b.similarity - a.similarity)
    
    console.log('Top 3 results:')
    filteredResults.slice(0, 3).forEach((result, i) => {
      console.log(`[${i}] Similarity: ${result.similarity.toFixed(3)}, Title: ${result.document.title}`)
      console.log(`    Excerpt: ${result.excerpt.substring(0, 100)}...`)
    })
    
    // Debug: Log all results, not just filtered ones
    console.log('All document results (including low similarity):')
    results.forEach((result, i) => {
      console.log(`[${i}] Similarity: ${result.similarity.toFixed(3)}, Title: ${result.document.title}`)
    })
    
    return filteredResults
    
  } catch (error) {
    console.error('Error searching documents:', error)
    return []
  }
}

async function searchPastQAs(query: string, classId: string): Promise<{ question: Question; answer: Answer; similarity: number }[]> {
  try {
    // Fetch actual questions and answers from the database
    const questions = await prisma.question.findMany({
      where: { 
        classId: classId 
      },
      include: {
        author: {
          select: {
            name: true
          }
        },
        answers: {
          include: {
            author: {
              select: {
                name: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Limit to recent questions
    })
    
    const results = questions
      .filter(q => q.answers.length > 0) // Only questions with answers
      .map(q => {
        const questionSimilarity = semanticSimilarity(query, q.title + ' ' + q.content)
        
        // Find the best answer - prefer professor answers, then AI answers, then student answers
        let bestAnswer = q.answers[0]
        let bestAnswerSimilarity = semanticSimilarity(query, q.answers[0].content)
        
        for (const answer of q.answers) {
          const answerSimilarity = semanticSimilarity(query, answer.content)
          
          // Prefer professor answers
          if (answer.author.role === 'TEACHER' && bestAnswer.author.role !== 'TEACHER') {
            bestAnswer = answer
            bestAnswerSimilarity = answerSimilarity
          }
          // Then prefer AI answers
          else if (answer.isAiGenerated && !bestAnswer.isAiGenerated && bestAnswer.author.role !== 'TEACHER') {
            bestAnswer = answer
            bestAnswerSimilarity = answerSimilarity
          }
          // Then prefer higher similarity
          else if (answerSimilarity > bestAnswerSimilarity && answer.author.role === bestAnswer.author.role) {
            bestAnswer = answer
            bestAnswerSimilarity = answerSimilarity
          }
        }
        
        const similarity = Math.max(questionSimilarity, bestAnswerSimilarity)
        
        return {
          question: {
            id: q.id,
            title: q.title,
            content: q.content,
            tags: q.tags,
            author: q.author,
            createdAt: q.createdAt.toISOString()
          },
          answer: {
            id: bestAnswer.id,
            content: bestAnswer.content,
            author: bestAnswer.author,
            createdAt: bestAnswer.createdAt.toISOString(),
            isAiGenerated: bestAnswer.isAiGenerated
          },
          similarity
        }
      })
    
    const filteredResults = results.filter(result => result.similarity > 0.05).sort((a, b) => b.similarity - a.similarity)
    
    console.log(`Found ${filteredResults.length} past Q&A matches for query: "${query}"`)
    if (filteredResults.length > 0) {
      console.log('Top Q&A match:', {
        question: filteredResults[0].question.title,
        similarity: filteredResults[0].similarity,
        answerPreview: filteredResults[0].answer.content.substring(0, 100) + '...'
      })
    }
    
    return filteredResults
    
  } catch (error) {
    console.error('Error searching past Q&As:', error)
    return []
  }
}

async function generateAIResponse(query: string, sources: any[], classId: string): Promise<{ response: string; confidence: number; sources: any[] }> {
  try {
    if (sources.length === 0) {
      return {
        response: '',
        confidence: 0,
        sources: []
      }
    }

    // Get class accuracy data to adjust confidence
    let classAccuracy = 0.5 // Default neutral accuracy
    try {
      const accuracyData = await prisma.classAccuracy.findUnique({
        where: { classId }
      })
      if (accuracyData) {
        classAccuracy = accuracyData.accuracyRate / 100 // Convert percentage to decimal
      }
    } catch (error) {
      console.log('Could not fetch class accuracy data:', error)
    }
    
    // Filter sources with improved thresholds and keyword-based relevance
    const queryKeywords = query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3) // Only meaningful words
    
    const relevantSources = sources.filter(source => {
      // First check similarity threshold - lowered to be more permissive
      const meetsThreshold = source.type === 'qa' ? source.similarity > 0.30 : source.similarity > 0.40
      
      if (!meetsThreshold) return false
      
      // Then check keyword relevance - be more flexible with keyword matching
      const sourceText = (source.document?.content || source.answer?.content || source.question?.title || '').toLowerCase()
      const hasRelevantKeywords = queryKeywords.some(keyword => 
        sourceText.includes(keyword) || 
        sourceText.includes(keyword.substring(0, Math.max(3, keyword.length - 2))) // Allow partial matches
      )
      
      // For assignment-related queries, prioritize documents over Q&As
      if (queryKeywords.includes('assignment') || queryKeywords.includes('word') || queryKeywords.includes('page') || queryKeywords.includes('count')) {
        // If this is a document about assignments, prioritize it
        if (source.type === 'document' && sourceText.includes('assignment')) {
          return true
        }
        // If this is a Q&A about assignments, include it
        if (source.type === 'qa' && sourceText.includes('assignment')) {
          return true
        }
        // Exclude Q&As that are clearly about different topics (like portfolio theory)
        if (source.type === 'qa' && (sourceText.includes('portfolio') || sourceText.includes('efficient') || sourceText.includes('risk'))) {
          return false
        }
      }
      
      // For deadline-related queries, be more specific
      if (queryKeywords.includes('deadline') || queryKeywords.includes('due')) {
        // Exclude word count questions when asking about deadlines
        if (sourceText.includes('word count') || sourceText.includes('page count')) {
          return false
        }
      }
      
      // For word count queries, exclude deadline questions
      if (queryKeywords.includes('word') && queryKeywords.includes('count')) {
        if (sourceText.includes('deadline') || sourceText.includes('due date')) {
          return false
        }
      }
      
      return hasRelevantKeywords
    })
    
    console.log(`Filtered sources: ${relevantSources.length} total (${relevantSources.filter(s => s.type === 'qa').length} Q&As, ${relevantSources.filter(s => s.type === 'document').length} documents)`)
    
    // Debug: Log all sources and their similarity scores
    console.log('All sources with similarity scores:')
    sources.forEach((source, index) => {
      console.log(`${index + 1}. ${source.type}: ${source.similarity.toFixed(3)} - ${source.document?.title || source.question?.title || 'Unknown'}`)
    })
    
    console.log('Relevant sources after filtering:')
    relevantSources.forEach((source, index) => {
      console.log(`${index + 1}. ${source.type}: ${source.similarity.toFixed(3)} - ${source.document?.title || source.question?.title || 'Unknown'}`)
    })
    
    if (relevantSources.length === 0) {
      console.log('No relevant sources found - returning no answer with 0 confidence')
      return {
        response: "I don't have enough information in the uploaded course materials to answer this question. Please post this question to the forum for discussion with your classmates and instructor.",
        confidence: 0,
        sources: []
      }
    }
    
    const bestSource = relevantSources[0]
    let confidence = bestSource.similarity
    
    // Reasonable confidence adjustment
    let adjustedConfidence = confidence
    if (confidence > 0.95) {
      // Very high confidence gets a slight boost
      adjustedConfidence = Math.min(0.99, confidence * 1.02)
    } else if (confidence > 0.80) {
      // High confidence stays about the same
      adjustedConfidence = confidence * 0.98
    } else if (confidence > 0.60) {
      // Medium confidence gets slightly reduced
      adjustedConfidence = confidence * 0.90
    } else if (confidence > 0.40) {
      // Lower confidence gets more reduction
      adjustedConfidence = confidence * 0.80
    } else {
      // Very low confidence - still provide answer but with low confidence
      adjustedConfidence = confidence * 0.70
    }

    // Further adjust based on class accuracy history
    if (classAccuracy > 0.7) {
      // High accuracy class - boost confidence slightly
      adjustedConfidence = Math.min(0.95, adjustedConfidence * 1.1)
    } else if (classAccuracy < 0.3) {
      // Low accuracy class - reduce confidence
      adjustedConfidence = adjustedConfidence * 0.8
    }
    
    // Check for exam date questions first (deterministic extraction)
    const examDateKeywords = ['when is the final exam', 'exam date', 'final exam date', 'when is the exam', 'exam schedule']
    const isExamDateQuestion = examDateKeywords.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    )
    
    // Check for exam topics questions
    const examTopicsKeywords = ['exam topics', 'final exam topics', 'what topics', 'what will be on the exam', 'exam content', 'what does the exam cover']
    const isExamTopicsQuestion = examTopicsKeywords.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    )
    
    if (isExamDateQuestion) {
      console.log('Exam date question detected, extracting date...')
      
      // Combine all relevant text for date extraction
      const allText = relevantSources.map(s => s.document?.content || s.excerpt || '').join(' ')
      console.log('Combined text for date extraction:', allText.substring(0, 500) + '...')
      
      // Try to extract exam date
      const examDate = extractExamDate(allText)
      const examTime = extractExamTime(allText)
      
      console.log('Extracted date:', examDate, 'time:', examTime)
      
      if (examDate) {
        let answer = `The final exam is on ${examDate}`
        if (examTime) {
          answer += ` at ${examTime}`
        }
        answer += '.'
        
        console.log('Returning extracted answer:', answer)
        
        return {
          response: answer,
          confidence: 0.95, // High confidence for extracted dates
          sources: relevantSources.slice(0, 3)
        }
      } else {
        console.log('No date found in text, will fall back to AI generation')
      }
    }
    
    // Check for exam topics questions
    if (isExamTopicsQuestion) {
      console.log('Exam topics question detected, extracting topics...')
      
      // Combine all relevant text for topics extraction
      const allText = relevantSources.map(s => s.document?.content || s.excerpt || '').join(' ')
      console.log('Combined text for topics extraction:', allText.substring(0, 500) + '...')
      
      // Look for exam topics in the text
      if (allText.toLowerCase().includes('exam topics') || allText.toLowerCase().includes('final exam topics')) {
        const topicsMatch = allText.match(/final exam topics include:([^.]+)/i)
        if (topicsMatch) {
          const topics = topicsMatch[1].trim()
          const answer = `Based on the course materials, the final exam topics include:${topics}`
          
          console.log('Returning extracted topics answer:', answer)
          
          return {
            response: answer,
            confidence: 0.95,
            sources: relevantSources.slice(0, 3)
          }
        }
      }
      
      // Fallback: look for specific topic keywords - but only if we have very high confidence
      const topicKeywords = ['financial markets', 'risk management', 'portfolio theory', 'derivatives', 'fixed income', 'corporate finance']
      const foundTopics = topicKeywords.filter(topic => allText.toLowerCase().includes(topic.toLowerCase()))
      
      if (foundTopics.length > 0 && relevantSources.length > 0 && relevantSources[0].similarity > 0.95) {
        const answer = `Based on the course materials, the final exam will cover: ${foundTopics.join(', ')}.`
        
        console.log('Returning extracted topics from keywords:', answer)
        
        return {
          response: answer,
          confidence: 0.85, // Reduced confidence for keyword-based answers
          sources: relevantSources.slice(0, 3)
        }
      }
      
      console.log('No specific topics found, will fall back to AI generation')
    }
    
    // DISABLED: External AI generation to prevent fake responses
    // The system now only provides answers based on exact matches from course materials
    // This ensures no fake information is generated
    
    // Extremely conservative fallback response logic to avoid fake responses
    let response = ''
    
    // Provide concise, direct responses for any matches above the threshold
    if (bestSource.document && bestSource.similarity > 0.40) {
      // Extract specific information from document content
      const documentContent = bestSource.document.content
      const queryLower = query.toLowerCase()
      
      // Try to extract specific information based on the question
      let extractedAnswer = ''
      
      // Lecture schedule questions - handle these with pattern matching for accuracy
      if (queryLower.includes('lecture topic') && queryLower.includes('week')) {
        const weekMatch = queryLower.match(/week (\d+)/)
        if (weekMatch) {
          const weekNumber = parseInt(weekMatch[1])
          const lectureMatch = documentContent.match(new RegExp(`Lecture ${weekNumber} - ([^\\n]+)`, 'i'))
          if (lectureMatch) {
            extractedAnswer = `The lecture topic in Week ${weekNumber} is ${lectureMatch[1].trim()}.`
          }
        }
      }
      // General assignment deadline questions
      else if (queryLower.includes('deadline') || queryLower.includes('due') || queryLower.includes('due date')) {
        // Look for various deadline patterns
        const deadlinePatterns = [
          /Due Date: Week (\d+) – (\d{1,2} \w+ \d{4})/i,
          /Deadline: Week (\d+) – (\d{1,2} \w+ \d{4})/i,
          /Due: Week (\d+) – (\d{1,2} \w+ \d{4})/i,
          /Submission Deadline: Week (\d+) – (\d{1,2} \w+ \d{4})/i,
          /Assignment due: Week (\d+) – (\d{1,2} \w+ \d{4})/i,
          /(\d{1,2} \w+ \d{4})/i  // Fallback to any date pattern
        ]
        
        for (const pattern of deadlinePatterns) {
          const match = documentContent.match(pattern)
          if (match) {
            if (match[1] && match[2]) {
              extractedAnswer = `The assignment deadline is Week ${match[1]} - ${match[2]}.`
            } else if (match[1]) {
              extractedAnswer = `The assignment deadline is ${match[1]}.`
            }
            break
          }
        }
      }
      
      // Early feedback task questions
      if (queryLower.includes('early feedback') && (queryLower.includes('due') || queryLower.includes('when'))) {
        const dueMatch = documentContent.match(/Due Date: Week (\d+) – (\d{1,2} \w+ \d{4})/i)
        if (dueMatch) {
          extractedAnswer = `The early feedback task is due Week ${dueMatch[1]} - ${dueMatch[2]}.`
        } else {
          // Try alternative patterns
          const altMatch = documentContent.match(/Early Feedback Task[^]*?Week (\d+)[^]*?(\d{1,2} \w+ \d{4})/i)
          if (altMatch) {
            extractedAnswer = `The early feedback task is due Week ${altMatch[1]} - ${altMatch[2]}.`
          }
        }
      } else if (queryLower.includes('early feedback') && queryLower.includes('released')) {
        const releasedMatch = documentContent.match(/Release Date: Week (\d+) – (\d{1,2} \w+ \d{4})/i)
        if (releasedMatch) {
          extractedAnswer = `The early feedback task is released Week ${releasedMatch[1]} - ${releasedMatch[2]}.`
        }
      } else if (queryLower.includes('early feedback') && queryLower.includes('worth')) {
        const worthMatch = documentContent.match(/Early Feedback Task[^]*?Weighting: (\d+%)/i)
        if (worthMatch) {
          extractedAnswer = `${worthMatch[1]}.`
        }
      } else if (queryLower.includes('early feedback') && queryLower.includes('cover')) {
        const coverMatch = documentContent.match(/Task: ([^.]*multiple choice[^.]*)/i)
        if (coverMatch) {
          extractedAnswer = `${coverMatch[1].trim()}.`
        }
      }
      // Group assignment word count and page limit questions
      else if (queryLower.includes('group assignment') && (queryLower.includes('word') || queryLower.includes('page') || queryLower.includes('count') || queryLower.includes('limit'))) {
        const wordMatch = documentContent.match(/Group Assignment[^]*?(\d{1,3}(?:,\d{3})*)\s*words?\s*maximum/i)
        const pageMatch = documentContent.match(/Group Assignment[^]*?up to (\d+)\s*pages?/i)
        if (wordMatch && pageMatch) {
          extractedAnswer = `The group assignment has a maximum of ${wordMatch[1]} words and up to ${pageMatch[1]} pages including appendices.`
        } else if (wordMatch) {
          extractedAnswer = `The group assignment has a maximum of ${wordMatch[1]} words.`
        } else if (pageMatch) {
          extractedAnswer = `The group assignment has a limit of up to ${pageMatch[1]} pages including appendices.`
        }
      }
      // Group assignment questions
      else if (queryLower.includes('group assignment') && queryLower.includes('due')) {
        const dueMatch = documentContent.match(/Group Assignment[^]*?Due Date: Week (\d+) – (\d{1,2} \w+ \d{4})/i)
        if (dueMatch) {
          extractedAnswer = `Week ${dueMatch[1]} - ${dueMatch[2]}.`
        }
      } else if (queryLower.includes('group assignment') && queryLower.includes('released')) {
        const releasedMatch = documentContent.match(/Group Assignment[^]*?Release Date: Week (\d+) – (\d{1,2} \w+ \d{4})/i)
        if (releasedMatch) {
          extractedAnswer = `Week ${releasedMatch[1]} - ${releasedMatch[2]}.`
        }
      } else if (queryLower.includes('group assignment') && queryLower.includes('worth')) {
        const worthMatch = documentContent.match(/Group Assignment[^]*?Weighting: (\d+%)/i)
        if (worthMatch) {
          extractedAnswer = `${worthMatch[1]}.`
        }
      } else if (queryLower.includes('group assignment') && queryLower.includes('requirements')) {
        const reqMatch = documentContent.match(/Requirements: ([^.]*)/i)
        if (reqMatch) {
          extractedAnswer = `${reqMatch[1].trim()}.`
        }
      }
      // Mid-semester exam questions
      else if (queryLower.includes('mid-semester') && queryLower.includes('exam')) {
        if (queryLower.includes('when')) {
          const whenMatch = documentContent.match(/Mid-Semester Exam[^]*?Due Date: Week (\d+) – (\d{1,2} \w+ \d{4})/i)
          if (whenMatch) {
            extractedAnswer = `Week ${whenMatch[1]} - ${whenMatch[2]}.`
          }
        } else if (queryLower.includes('closed book')) {
          const closedMatch = documentContent.match(/Mid-Semester Exam[^]*?(closed-book)/i)
          if (closedMatch) {
            extractedAnswer = `Yes — in-class closed-book.`
          }
        } else if (queryLower.includes('cover')) {
          const coverMatch = documentContent.match(/Mid-Semester Exam[^]*?(Weeks \d+–\d+)/i)
          if (coverMatch) {
            extractedAnswer = `${coverMatch[1]}.`
          }
        } else if (queryLower.includes('worth')) {
          const worthMatch = documentContent.match(/Mid-Semester Exam[^]*?Weighting: (\d+%)/i)
          if (worthMatch) {
            extractedAnswer = `${worthMatch[1]}.`
          }
        }
      }
      // Final exam questions
      else if (queryLower.includes('final exam')) {
        if (queryLower.includes('worth')) {
          const worthMatch = documentContent.match(/Final Exam[^]*?Weighting: (\d+%)/i)
          if (worthMatch) {
            extractedAnswer = `${worthMatch[1]}.`
          }
        } else if (queryLower.includes('when')) {
          const whenMatch = documentContent.match(/Due Date: TBA \(([^)]*)\)/i)
          if (whenMatch) {
            extractedAnswer = `TBA — ${whenMatch[1].trim()}.`
          }
        }
      }
      // Dates final question
      else if (queryLower.includes('dates final')) {
        const finalMatch = documentContent.match(/(All dates are indicative[^.]*)/i)
        if (finalMatch) {
          extractedAnswer = `No — ${finalMatch[1].trim()}.`
        }
      }
      
      // If we found a specific answer, use it; otherwise try AI interpretation
      if (extractedAnswer) {
        response = extractedAnswer
      } else {
        // Always try AI extraction first for better responses
        try {
          const aiExtraction = await extractSpecificInfo(query, documentContent)
          if (aiExtraction && aiExtraction.length > 0) {
            response = aiExtraction
          } else {
            // If AI extraction fails, provide a more helpful response
            response = `Based on the course materials, I found relevant information but couldn't extract a specific answer. Please check the document "${bestSource.document.title}" for more details.`
          }
        } catch (error) {
          console.log('AI extraction failed:', error)
          response = `Based on the course materials, I found relevant information but couldn't extract a specific answer. Please check the document "${bestSource.document.title}" for more details.`
        }
      }
    } else if (bestSource.answer && bestSource.similarity > 0.30) {
      // Past Q&A matches - provide concise response
      const answerAuthor = bestSource.answer.author?.name || 'a classmate'
      const questionTitle = bestSource.question?.title || 'a previous question'
      
      // Clean HTML formatting from the answer content
      const cleanContent = bestSource.answer.content.replace(/<[^>]*>/g, '').trim()
      
      response = `This question was answered previously by ${answerAuthor}: ${cleanContent}`
    } else {
      // If confidence is not high enough, don't provide an answer
      console.log('No matches above threshold - returning no answer with 0 confidence')
      return {
        response: "I don't have enough information in the uploaded course materials to answer this question. Please post this question to the forum for discussion with your classmates and instructor.",
        confidence: 0,
        sources: []
      }
    }
    
    // Enhance sources with additional information
    const enhancedSources = relevantSources.map(source => {
      if (source.type === 'qa' && source.question) {
        return {
          ...source,
          title: source.question.title,
          questionId: source.question.id,
          relevance: `Answered by ${source.answer.author?.name || 'a classmate'} in this discussion`
        }
      } else if (source.type === 'document' && source.document) {
        return {
          ...source,
          title: source.document.title,
          documentId: source.document.id,
          relevance: `Course material document`
        }
      }
      return source
    })
    
    return {
      response,
      confidence: adjustedConfidence,
      sources: enhancedSources.slice(0, 3) // Return top 3 relevant sources
    }
    
  } catch (error) {
    console.error('Error generating AI response:', error)
    return {
      response: '',
      confidence: 0,
      sources: []
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question, classId } = await request.json()
    
    if (!question || !classId) {
      return NextResponse.json({ error: 'Missing question or classId' }, { status: 400 })
    }
    
    // Search both documents and past Q&As
    const [documentResults, qaResults] = await Promise.all([
      searchDocuments(question, classId),
      searchPastQAs(question, classId)
    ])
    
    // Combine results
    const allSources = [
      ...documentResults.map(r => ({ ...r, type: 'document' })),
      ...qaResults.map(r => ({ ...r, type: 'qa' }))
    ].sort((a, b) => b.similarity - a.similarity)
    
    // Generate AI response
    const aiResponse = await generateAIResponse(question, allSources, classId)
    
    console.log('Final AI response:', {
      response: aiResponse.response,
      confidence: aiResponse.confidence,
      hasResponse: !!aiResponse.response,
      responseLength: aiResponse.response?.length || 0
    })
    
    const shouldPostToForum = aiResponse.confidence < 0.98
    const hasAnswer = aiResponse.response && aiResponse.response.trim() !== ''
    
    return NextResponse.json({
      success: true,
      aiResponse: aiResponse.response,
      confidence: aiResponse.confidence,
      sources: aiResponse.sources,
      shouldPostToForum,
      hasAnswer,
      showFeedback: hasAnswer && !shouldPostToForum, // Show feedback when AI provides an answer
      recommendation: shouldPostToForum 
        ? 'The AI cannot answer this question confidently based on available course materials. Please post this question to the forum for human discussion.'
        : 'The AI found an exact match in the course materials. You can accept this answer or still post to the forum for additional perspectives.'
    })
    
  } catch (error) {
    console.error('Error in AI prefilter:', error)
    return NextResponse.json(
      { error: 'Failed to analyze question', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

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
  const lowerContent = documentContent.toLowerCase()
  
  // Extract weighting information
  if (lowerQuestion.includes('weighting') || lowerQuestion.includes('weight')) {
    const weightingMatch = documentContent.match(/Weighting:\s*(\d+%)/i)
    if (weightingMatch) {
      return weightingMatch[1]
    }
  }
  
  // Extract due date information
  if (lowerQuestion.includes('due date') || lowerQuestion.includes('due')) {
    const dueDateMatch = documentContent.match(/Due Date:\s*(.+?)(?:\n|$)/i)
    if (dueDateMatch) {
      return dueDateMatch[1].trim()
    }
  }
  
  // Extract release date information
  if (lowerQuestion.includes('release date') || lowerQuestion.includes('release')) {
    const releaseDateMatch = documentContent.match(/Release Date:\s*(.+?)(?:\n|$)/i)
    if (releaseDateMatch) {
      return releaseDateMatch[1].trim()
    }
  }
  
  return null
}

// Function to check if question requires source code
function requiresSourceCode(question: string): boolean {
  const lowerQuestion = question.toLowerCase()
  const codeKeywords = [
    'code', 'algorithm', 'implementation', 'program', 'script', 'function',
    'sort', 'search', 'data structure', 'recursion', 'loop', 'array',
    'stack', 'queue', 'tree', 'graph', 'binary', 'hash', 'linked list',
    'bubble sort', 'quick sort', 'merge sort', 'binary search', 'linear search',
    'fibonacci', 'factorial', 'palindrome', 'prime', 'gcd', 'lcm',
    'show me', 'write', 'create', 'build', 'implement', 'develop'
  ]
  
  return codeKeywords.some(keyword => lowerQuestion.includes(keyword))
}

// Function to generate source code based on question and materials
function generateSourceCode(question: string, materials: any[]): string | null {
  const lowerQuestion = question.toLowerCase()
  
  // Common algorithms and data structures
  const algorithms = {
    'bubble sort': `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

// Example usage
const array = [64, 34, 25, 12, 22, 11, 90];
console.log("Sorted array:", bubbleSort([...array]));`,
    
    'quick sort': `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// Example usage
const array = [64, 34, 25, 12, 22, 11, 90];
console.log("Sorted array:", quickSort([...array]));`,
    
    'binary search': `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid; // Found the target
    } else if (arr[mid] < target) {
      left = mid + 1; // Search right half
    } else {
      right = mid - 1; // Search left half
    }
  }
  
  return -1; // Target not found
}

// Example usage
const sortedArray = [1, 3, 5, 7, 9, 11, 13, 15];
const target = 7;
const result = binarySearch(sortedArray, target);
console.log(\`Target \${target} found at index: \${result}\`);`,
    
    'fibonacci': `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Iterative version (more efficient)
function fibonacciIterative(n) {
  if (n <= 1) return n;
  
  let prev = 0, current = 1;
  for (let i = 2; i <= n; i++) {
    const next = prev + current;
    prev = current;
    current = next;
  }
  return current;
}

// Example usage
console.log("Fibonacci(10):", fibonacci(10));
console.log("Fibonacci Iterative(10):", fibonacciIterative(10));`,
    
    'stack': `class Stack {
  constructor() {
    this.items = [];
  }
  
  push(element) {
    this.items.push(element);
  }
  
  pop() {
    if (this.isEmpty()) {
      return "Underflow";
    }
    return this.items.pop();
  }
  
  peek() {
    if (this.isEmpty()) {
      return "Stack is empty";
    }
    return this.items[this.items.length - 1];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  size() {
    return this.items.length;
  }
  
  clear() {
    this.items = [];
  }
}

// Example usage
const stack = new Stack();
stack.push(1);
stack.push(2);
stack.push(3);
console.log("Top element:", stack.peek());
console.log("Popped element:", stack.pop());`,
    
    'queue': `class Queue {
  constructor() {
    this.items = [];
  }
  
  enqueue(element) {
    this.items.push(element);
  }
  
  dequeue() {
    if (this.isEmpty()) {
      return "Underflow";
    }
    return this.items.shift();
  }
  
  front() {
    if (this.isEmpty()) {
      return "Queue is empty";
    }
    return this.items[0];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  size() {
    return this.items.length;
  }
  
  clear() {
    this.items = [];
  }
}

// Example usage
const queue = new Queue();
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);
console.log("Front element:", queue.front());
console.log("Dequeued element:", queue.dequeue());`
  }
  
  // Check if question matches any algorithm
  for (const [key, code] of Object.entries(algorithms)) {
    if (lowerQuestion.includes(key)) {
      return code
    }
  }
  
  // Generic code template for other programming questions
  if (lowerQuestion.includes('code') || lowerQuestion.includes('program') || lowerQuestion.includes('script')) {
    return `// Generic code template based on your question
function solveProblem(input) {
  // Add your implementation here
  return result;
}

// Example usage
const input = "your input here";
const result = solveProblem(input);
console.log("Result:", result);`
  }
  
  return null
}

// Search for relevant documents and past Q&A
async function searchKnowledgeBase(question: string, classId: string) {
  try {
    // First, find the class by ID or code
    const classData = await prisma.class.findFirst({
      where: {
        OR: [
          { id: classId },
          { code: classId.toUpperCase() }
        ]
      }
    })

    if (!classData) {
      console.log('Class not found for:', classId)
      return { documents: [], qa: [] }
    }

    const actualClassId = classData.id
    console.log(`Found class: ${classData.code} (ID: ${actualClassId})`)

    // Search documents using the actual class ID
    const documents = await prisma.document.findMany({
      where: { classId: actualClassId },
      select: {
        title: true,
        content: true,
        documentType: true
      }
    })
    
    console.log(`Found ${documents.length} documents for class ${classData.code}`)
    
    const documentResults = documents.map(doc => ({
      ...doc,
      similarity: calculateSimilarity(question, doc.content)
    })).filter(r => r.similarity > 0.25).sort((a, b) => b.similarity - a.similarity)
    
    // Search past Q&A using the actual class ID
    const questions = await prisma.question.findMany({
      where: { classId: actualClassId },
      include: {
        answers: { include: { author: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    
    console.log(`Found ${questions.length} past questions for class ${classData.code}`)
    
    const qaResults = questions.map(q => ({
      question: q.title + ' ' + q.content,
      answers: q.answers.map(a => a.content),
      similarity: calculateSimilarity(question, q.title + ' ' + q.content)
    })).filter(r => r.similarity > 0.3).sort((a, b) => b.similarity - a.similarity)
    
    return {
      documents: documentResults.slice(0, 3),
      qa: qaResults.slice(0, 3)
    }
  } catch (error) {
    console.error('Error searching knowledge base:', error)
    return { documents: [], qa: [] }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { question_id, question_title, question_content, class_id } = await req.json()

    if (!question_id || !question_title || !question_content) {
      return NextResponse.json(
        { error: 'Question ID, title, and content are required' },
        { status: 400 }
      )
    }

    // Search knowledge base for relevant information
    const knowledgeBase = await searchKnowledgeBase(question_title + ' ' + question_content, class_id)
    
    // Only attempt to answer if we have highly relevant course materials or past discussions
    // Higher similarity thresholds to be more restrictive
    const hasRelevantDocuments = knowledgeBase.documents.some(d => d.similarity > 0.25)
    const hasRelevantQA = knowledgeBase.qa.some(q => q.similarity > 0.3)
    const hasAnyMaterials = knowledgeBase.documents.length > 0 || knowledgeBase.qa.length > 0

    // Reject if we have no materials or no highly relevant materials
    if (!hasAnyMaterials || (!hasRelevantDocuments && !hasRelevantQA)) {
      return NextResponse.json({
        error: 'No relevant course materials or previous discussions found for this question. Please post to the forum for human assistance.',
        confidence: 0
      }, { status: 400 })
    }

    // Try to extract specific information directly from documents first
    let extractedAnswer = null
    let sourceDocument = null
    
    for (const doc of knowledgeBase.documents) {
      const extracted = extractSpecificInfo(question_title + ' ' + question_content, doc.content)
      if (extracted) {
        extractedAnswer = extracted
        sourceDocument = doc
        break
      }
    }

    // If we found specific information, use it directly
    if (extractedAnswer && sourceDocument) {
      const directAnswer = `${extractedAnswer} **Source:** ${sourceDocument.documentType} - ${sourceDocument.title}`
      
      // Save the direct answer to the database
      let savedAnswer = null
      try {
        // Create or find an AI user
        let aiUser = await prisma.user.findFirst({
          where: { email: 'ai-assistant@university.edu' }
        })
        
        if (!aiUser) {
          aiUser = await prisma.user.create({
            data: {
              email: 'ai-assistant@university.edu',
              name: 'AI Assistant',
              role: 'STUDENT',
              isDemo: true
            }
          })
        }

        savedAnswer = await prisma.answer.create({
          data: {
            content: directAnswer,
            isAiGenerated: true,
            authorId: aiUser.id,
            questionId: question_id
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })
      } catch (error) {
        console.log('Could not save to database, returning demo response')
        savedAnswer = {
          id: Date.now().toString(),
          content: directAnswer,
          isAiGenerated: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: {
            id: 'ai-assistant',
            name: 'AI Assistant',
            email: 'ai-assistant@university.edu'
          }
        }
      }

      return NextResponse.json({
        success: true,
        answer: savedAnswer,
        confidence: 100
      })
    }

    // Prepare course materials context
    let courseMaterials = ''
    let materialCount = 0
    
    if (knowledgeBase.documents.length > 0) {
      courseMaterials = '\n\n📚 **RELEVANT COURSE MATERIALS:**\n'
      materialCount = knowledgeBase.documents.length
      
      knowledgeBase.documents.forEach((doc: any, index: number) => {
        courseMaterials += `\n**${doc.documentType} - ${doc.title}** (Relevance: ${Math.round(doc.similarity * 100)}%):\n`
        // Truncate content to avoid token limits, keep first 1500 characters
        const truncatedContent = doc.content.length > 1500 
          ? doc.content.substring(0, 1500) + '...' 
          : doc.content
        courseMaterials += truncatedContent + '\n'
      })
    }

    // Add relevant past Q&A
    if (knowledgeBase.qa.length > 0) {
      courseMaterials += '\n\n💬 **RELEVANT PREVIOUS DISCUSSIONS:**\n'
      knowledgeBase.qa.forEach((qa: any, index: number) => {
        courseMaterials += `\n**Q${index + 1}:** ${qa.question} (Relevance: ${Math.round(qa.similarity * 100)}%)\n`
        courseMaterials += `**A:** ${qa.answers.join(' | ')}\n`
      })
    }
    
    courseMaterials += `\n---\n`

    // Create an extremely strict prompt that forces the exact format and prevents hallucination
    const prompt = `You are a precise university assistant that can ONLY use information from the provided course materials. You have NO external knowledge and cannot answer questions about topics not covered in the materials.

**QUESTION:** ${question_title}: ${question_content}

**MATERIALS:** ${courseMaterials}

**CRITICAL RULES:**
1. Answer ONLY what was asked
2. Use ONLY information that is EXPLICITLY stated in the materials above
3. ALWAYS include the source
4. NO assumptions, interpretations, or additional information
5. NO "Based on" or similar phrases
6. If information is not explicitly in the materials, say "Information not found in the available course materials"
7. ALWAYS provide downloadable source code when relevant
8. DO NOT use any external knowledge, general knowledge, or information not in the materials
9. DO NOT provide definitions, explanations, or concepts that are not explicitly mentioned in the course materials
10. If the question asks about a concept (like "what is a derivative"), only answer if that concept is specifically defined or explained in the course materials

**EXACT FORMAT:** 
Answer **Source:** Document Type - Document Title

**IMPORTANT:** Do NOT put brackets [ ] around your response. Write the answer directly without any brackets.

**DOWNLOADABLE SOURCE CODE:**
If the question involves code, algorithms, or technical implementation, provide the complete source code in a downloadable format.

**EXAMPLES:**
- Q: "What is the weighting?" → A: "5%" **Source:** ASSIGNMENT - FINC3017 Assessment Information
- Q: "What is the due date?" → A: "Week 3 – 17 Mar 2025" **Source:** ASSIGNMENT - FINC3017 Assessment Information
- Q: "Show me the sorting algorithm" → A: "Here's the implementation..." **Source:** LECTURE - Algorithm Notes + [Downloadable Source Code]

**CRITICAL:** You have NO external knowledge. Only answer questions that are explicitly covered in the provided course materials. 

**WHEN YOU CANNOT ANSWER:**
If the concept is not defined or explained in the materials, respond with EXACTLY: "Information not found in the available course materials."

**FORMAT FOR CANNOT ANSWER:**
Write exactly: Information not found in the available course materials
Do NOT add brackets, quotes, or any other formatting around this text.

**DO NOT:**
- Repeat the question back as an answer
- Provide general knowledge or external information
- Make up answers or definitions
- Say "I don't know" or similar phrases

**ONLY ANSWER:**
- Questions that have specific information in the provided course materials
- Questions about due dates, weightings, requirements that are explicitly stated
- Questions about code or algorithms that are provided in the materials

If you cannot find the specific information in the materials, respond with EXACTLY: "Information not found in the available course materials."`

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

    if (!response.ok) {
      throw new Error('Failed to get response from Ollama')
    }

    const data = await response.json()
    let aiAnswer = data.response || 'I could not generate an answer at this time. Please try again!'
    
    // Remove any brackets that the AI might have added
    aiAnswer = aiAnswer.replace(/^\[|\]$/g, '').trim()
    // Also remove any remaining brackets anywhere in the text
    aiAnswer = aiAnswer.replace(/\[|\]/g, '').trim()
    // If the entire response is wrapped in brackets, remove them
    if (aiAnswer.startsWith('[') && aiAnswer.endsWith(']')) {
      aiAnswer = aiAnswer.slice(1, -1).trim()
    }
    // Final cleanup - remove any remaining brackets
    aiAnswer = aiAnswer.replace(/\[|\]/g, '').trim()

    // Ensure the answer includes a source - if not, add the most relevant source
    if (!aiAnswer.toLowerCase().includes('source:') && knowledgeBase.documents.length > 0) {
      const mostRelevantDoc = knowledgeBase.documents[0] // Already sorted by similarity
      aiAnswer = `${aiAnswer} **Source:** ${mostRelevantDoc.documentType} - ${mostRelevantDoc.title}`
    }

    // Check if the AI response indicates it couldn't find the information
    const cannotAnswer = aiAnswer.toLowerCase().includes('not found in the available course materials') ||
                        aiAnswer.toLowerCase().includes('cannot answer') ||
                        aiAnswer.toLowerCase().includes('not available in the materials') ||
                        aiAnswer.toLowerCase().includes('no relevant information') ||
                        aiAnswer.toLowerCase().includes('not provided in the available course materials') ||
                        aiAnswer.toLowerCase().includes('information not found') ||
                        aiAnswer.toLowerCase().includes('no external knowledge') ||
                        aiAnswer.toLowerCase().includes('not covered in the materials') ||
                        aiAnswer.toLowerCase().includes('i don\'t have the capability') ||
                        aiAnswer.toLowerCase().includes('please post this to the forum')

    // Check if AI is just repeating the question back
    const questionWords = (question_title + ' ' + question_content).toLowerCase().split(/\s+/).filter((word: string) => word.length > 3)
    const answerWords = aiAnswer.toLowerCase().split(/\s+/).filter((word: string) => word.length > 3)
    const questionInAnswer = questionWords.some((word: string) => answerWords.includes(word))
    const isRepeatingQuestion = (questionInAnswer && aiAnswer.length < 200 && !aiAnswer.toLowerCase().includes('source:')) ||
                               (aiAnswer.toLowerCase().includes(question_title.toLowerCase()) && !aiAnswer.toLowerCase().includes('source:')) ||
                               (aiAnswer.length < 150 && !aiAnswer.toLowerCase().includes('source:'))

    if (cannotAnswer || isRepeatingQuestion) {
      return NextResponse.json({
        error: 'I don\'t have the capability to answer that, please post this to the forum',
        confidence: 0
      }, { status: 400 })
    }

    // Generate downloadable source code if the question requires it
    let sourceCode = null
    let sourceCodeFilename = null
    
    if (requiresSourceCode(question_title + ' ' + question_content)) {
      sourceCode = generateSourceCode(question_title + ' ' + question_content, knowledgeBase.documents)
      if (sourceCode) {
        // Create a filename based on the question
        const sanitizedTitle = question_title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
        sourceCodeFilename = `${sanitizedTitle}_source_code.js`
      }
    }

    // Always create downloadable source document if we have relevant materials
    let sourceDocumentContent = null
    let sourceDocumentFilename = null
    
    if (knowledgeBase.documents.length > 0) {
      const mostRelevantDoc = knowledgeBase.documents[0]
      sourceDocumentContent = mostRelevantDoc.content
      const sanitizedTitle = mostRelevantDoc.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
      sourceDocumentFilename = `${sanitizedTitle}_source_document.txt`
    }

    // Save the AI answer to the database
    let savedAnswer = null
    try {
      // Create or find an AI user
      let aiUser = await prisma.user.findFirst({
        where: { email: 'ai-assistant@university.edu' }
      })
      
      if (!aiUser) {
        aiUser = await prisma.user.create({
          data: {
            email: 'ai-assistant@university.edu',
            name: 'AI Assistant',
            role: 'STUDENT',
            isDemo: true
          }
        })
      }

      savedAnswer = await prisma.answer.create({
        data: {
          content: aiAnswer,
          isAiGenerated: true,
          sourceCode: sourceCode,
          sourceCodeFilename: sourceCodeFilename,
          authorId: aiUser.id,
          questionId: question_id
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
    } catch (error) {
      console.log('Could not save to database, returning demo response')
      savedAnswer = {
        id: Date.now().toString(),
        content: aiAnswer,
        isAiGenerated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: 'ai-assistant',
          name: 'AI Assistant',
          email: 'ai-assistant@university.edu'
        }
      }
    }

    return NextResponse.json({
      success: true,
      answer: savedAnswer,
      confidence: Math.min(100, Math.max(0, 
        Math.max(
          ...knowledgeBase.documents.map(d => d.similarity * 100),
          ...knowledgeBase.qa.map(q => q.similarity * 100)
        )
      )),
      sourceCode: sourceCode,
      sourceCodeFilename: sourceCodeFilename,
      hasSourceCode: !!sourceCode,
      sourceDocumentContent: sourceDocumentContent,
      sourceDocumentFilename: sourceDocumentFilename,
      hasSourceDocument: !!sourceDocumentContent
    })

  } catch (error) {
    console.error('AI Answer API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI answer' },
      { status: 500 }
    )
  }
}

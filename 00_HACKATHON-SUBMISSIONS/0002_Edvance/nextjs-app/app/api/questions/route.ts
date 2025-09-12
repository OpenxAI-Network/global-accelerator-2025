import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const userId = searchParams.get('userId') // Get user ID to check their votes

    if (!classId) {
      return NextResponse.json({ error: 'Class ID required' }, { status: 400 })
    }

    // Get current timestamp for age calculations
    const now = new Date()

    // First, try to find the class by ID or code
    let actualClassId = classId
    const classRecord = await prisma.class.findFirst({
      where: {
        OR: [
          { id: classId },
          { code: classId.toUpperCase() }
        ]
      }
    })
    
    if (classRecord) {
      actualClassId = classRecord.id
    }

    const questions = await prisma.question.findMany({
      where: { classId: actualClassId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true
          }
        },
        _count: {
          select: {
            answers: true,
            votes: true
          }
        },
        votes: {
          select: {
            type: true,
            userId: true
          }
        }
      }
    })

    // Apply custom ranking algorithm
    const rankedQuestions = questions.map((question: any) => {
      const upVotes = question.votes.filter((vote: any) => vote.type === 'UP').length
      const downVotes = question.votes.filter((vote: any) => vote.type === 'DOWN').length
      const netVotes = upVotes - downVotes
      const isAnswered = question._count.answers > 0
      
      // Calculate age in hours
      const ageHours = Math.max(0, (now.getTime() - question.createdAt.getTime()) / (1000 * 60 * 60))
      
      // Ranking algorithm parameters
      const k = 5.0  // upvote saturation parameter
      const H = 48.0 // age saturation parameter (48 hours)
      
      let score: number
      
      if (!isAnswered) {
        // Unanswered questions: calculate sophisticated score
        const upvoteTerm = 1 - Math.exp(-Math.max(0, netVotes) / k)
        const ageTerm = Math.min(1.0, ageHours / H)
        score = 0.6 * ageTerm + 0.4 * upvoteTerm
      } else {
        // Answered questions: use negative score to push them below unanswered
        score = -1.0
      }
      
      return {
        question,
        upVotes,
        downVotes,
        netVotes,
        isAnswered,
        ageHours,
        score,
        // For answered questions, use last activity time for secondary sorting
        lastActivity: question.updatedAt || question.createdAt
      }
    })

    // Sort using the ranking algorithm
    rankedQuestions.sort((a, b) => {
      // Primary: unanswered first (isAnswered ascending)
      if (a.isAnswered !== b.isAnswered) {
        return a.isAnswered ? 1 : -1
      }
      
      // Secondary: score descending (higher scores first)
      if (Math.abs(a.score - b.score) > 0.001) {
        return b.score - a.score
      }
      
      // Tertiary: oldest first (posted_at ascending)
      if (a.question.createdAt.getTime() !== b.question.createdAt.getTime()) {
        return a.question.createdAt.getTime() - b.question.createdAt.getTime()
      }
      
      // Final tie-breaker: ID ascending
      return a.question.id.localeCompare(b.question.id)
    })

    // Transform ranked questions to match frontend interface
    const transformedQuestions = rankedQuestions.map((rankedItem: any) => {
      const question = rankedItem.question
      
      // Find user's vote if userId provided
      let userVote = null
      if (userId) {
        const userVoteRecord = question.votes.find((vote: any) => vote.userId === userId)
        if (userVoteRecord) {
          userVote = userVoteRecord.type.toLowerCase()
        }
      }
      
      return {
        id: question.id, // Keep string ID for database operations
        title: question.title,
        content: question.content,
        tags: JSON.parse(question.tags || '[]'),
        username: question.author.name,
        authorProfilePicture: question.author.profilePicture,
        created_at: question.createdAt.toISOString(),
        answer_count: question._count.answers,
        votes: rankedItem.netVotes,
        authorId: question.author.id,
        userVote: userVote, // 'up', 'down', or null
        // Add ranking metadata for debugging
        _ranking: {
          isAnswered: rankedItem.isAnswered,
          score: rankedItem.score,
          ageHours: rankedItem.ageHours,
          upVotes: rankedItem.upVotes,
          downVotes: rankedItem.downVotes
        }
      }
    })

    // Debug: Log ranking results
    console.log(`Ranking results for class ${classId}:`)
    transformedQuestions.forEach((q, index) => {
      console.log(`${index + 1}. "${q.title}" - Answered: ${q._ranking.isAnswered}, Score: ${q._ranking.score.toFixed(3)}, Age: ${q._ranking.ageHours.toFixed(1)}h, Votes: ${q._ranking.upVotes}/${q._ranking.downVotes}`)
    })

    return NextResponse.json({ 
      success: true, 
      questions: transformedQuestions 
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/questions called')
    const body = await request.json()
    console.log('Request body:', body)
    
    const { title, content, tags, classId, authorId } = body

    // Detailed validation with specific error messages
    if (!title || title.trim() === '') {
      console.log('Missing or empty title')
      return NextResponse.json({ error: 'Question title is required' }, { status: 400 })
    }

    if (!content || content.trim() === '') {
      console.log('Missing or empty content')
      return NextResponse.json({ error: 'Question content is required' }, { status: 400 })
    }

    if (!classId || classId.trim() === '') {
      console.log('Missing or empty classId')
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
    }

    if (!authorId || authorId.trim() === '') {
      console.log('Missing or empty authorId')
      return NextResponse.json({ error: 'Author ID is required' }, { status: 400 })
    }

    // Check if author exists
    console.log('Checking if author exists:', authorId)
    const author = await prisma.user.findUnique({
      where: { id: authorId }
    })

    if (!author) {
      console.log('Author not found:', authorId)
      return NextResponse.json({ error: 'Author not found. Please log in again.' }, { status: 404 })
    }

    console.log('Author found:', author.name)

    // Check if class exists (for new classes, we'll create a basic entry)
    console.log('Checking if class exists:', classId)
    let classExists = await prisma.class.findFirst({
      where: {
        OR: [
          { id: classId },
          { code: classId.toUpperCase() }
        ]
      }
    })

    if (!classExists) {
      console.log('Class not found, creating basic class entry for:', classId)
      // Create a basic class entry for new classes
      try {
        // Generate a unique code if the classId is already taken as a code
        const existingCode = await prisma.class.findUnique({
          where: { code: classId.toUpperCase() }
        })
        
        const uniqueCode = existingCode ? `${classId.toUpperCase()}_DEMO` : classId.toUpperCase()
        
        classExists = await prisma.class.create({
          data: {
            id: classId,
            name: `Class ${classId.toUpperCase()}`,
            code: uniqueCode,
            description: 'Auto-created class',
            teacherId: authorId, // Assign the first user as teacher temporarily
            semester: 'Current'
          }
        })
        console.log('Created new class:', classExists)
      } catch (classError) {
        console.error('Error creating class:', classError)
        return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
      }
    }

    console.log('Creating question...')
    const question = await prisma.question.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        tags: JSON.stringify(tags || []),
        classId: classExists.id, // Use the actual class ID from the database
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true
          }
        },
        _count: {
          select: {
            answers: true,
            votes: true
          }
        }
      }
    })

    console.log('Question created successfully:', question.id)

    // Transform to match frontend interface
    const transformedQuestion = {
      id: question.id,
      title: question.title,
      content: question.content,
      tags: JSON.parse(question.tags || '[]'),
      username: question.author.name,
      authorProfilePicture: question.author.profilePicture,
      created_at: question.createdAt.toISOString(),
      answer_count: question._count.answers,
      votes: 0,
      authorId: question.author.id
    }

    console.log('Returning transformed question:', transformedQuestion)
    return NextResponse.json({ 
      success: true, 
      question: transformedQuestion 
    })
  } catch (error) {
    console.error('Error creating question:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ 
      error: 'Failed to create question', 
      details: errorMessage
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { questionId, title, content, tags, userId } = await request.json()

    if (!questionId || !userId) {
      return NextResponse.json({ error: 'Question ID and User ID required' }, { status: 400 })
    }

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Find the question to check permissions
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true
          }
        },
        _count: {
          select: {
            answers: true,
            votes: true
          }
        }
      }
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // Check if user can edit (only question author)
    if (question.authorId !== userId) {
      return NextResponse.json({ error: 'Unauthorized to edit this question' }, { status: 403 })
    }

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        title: title.trim(),
        content: content.trim(),
        tags: JSON.stringify(tags || []),
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true
          }
        },
        _count: {
          select: {
            answers: true,
            votes: true
          }
        }
      }
    })

    // Transform to match frontend interface
    const transformedQuestion = {
      id: updatedQuestion.id,
      title: updatedQuestion.title,
      content: updatedQuestion.content,
      tags: JSON.parse(updatedQuestion.tags || '[]'),
      username: updatedQuestion.author.name,
      authorProfilePicture: updatedQuestion.author.profilePicture,
      created_at: updatedQuestion.createdAt.toISOString(),
      updated_at: updatedQuestion.updatedAt.toISOString(),
      answer_count: updatedQuestion._count.answers,
      votes: 0, // Will be calculated by the frontend
      authorId: updatedQuestion.author.id
    }

    return NextResponse.json({ 
      success: true, 
      question: transformedQuestion 
    })
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')

    if (!questionId || !userId) {
      return NextResponse.json({ error: 'Question ID and User ID required' }, { status: 400 })
    }

    // Find the question to check permissions
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        author: true,
        class: {
          include: {
            teacher: true
          }
        }
      }
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // Check if user can delete (question author or teacher of the class)
    const canDelete = question.authorId === userId || 
                     question.class.teacherId === userId ||
                     userRole === 'TEACHER'

    if (!canDelete) {
      return NextResponse.json({ error: 'Unauthorized to delete this question' }, { status: 403 })
    }

    await prisma.question.delete({
      where: { id: questionId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}
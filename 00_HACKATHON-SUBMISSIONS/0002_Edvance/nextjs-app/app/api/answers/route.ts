import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')
    const userId = searchParams.get('userId')

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 })
    }

    const answers = await prisma.answer.findMany({
      where: { questionId },
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
            votes: true
          }
        },
        votes: {
          select: {
            type: true,
            userId: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Transform to match frontend interface
    const transformedAnswers = answers.map((answer: any) => {
      const upVotes = answer.votes.filter((vote: any) => vote.type === 'UP').length
      const downVotes = answer.votes.filter((vote: any) => vote.type === 'DOWN').length
      
      // Find user's vote if userId provided
      let userVote = null
      if (userId) {
        const userVoteRecord = answer.votes.find((vote: any) => vote.userId === userId)
        if (userVoteRecord) {
          userVote = userVoteRecord.type.toLowerCase()
        }
      }
      
      return {
        id: answer.id,
        question_id: parseInt(questionId.slice(-8), 16), // Convert for compatibility
        content: answer.content,
        username: answer.author.name,
        authorProfilePicture: answer.author.profilePicture,
        created_at: answer.createdAt.toISOString(),
        is_ai_generated: answer.isAiGenerated,
        votes: upVotes - downVotes,
        authorId: answer.author.id,
        userVote: userVote,
        sourceCode: answer.sourceCode || null,
        sourceCodeFilename: answer.sourceCodeFilename || null,
        hasSourceCode: !!(answer.sourceCode && answer.sourceCodeFilename)
      }
    })

    return NextResponse.json({ 
      success: true, 
      answers: transformedAnswers 
    })
  } catch (error) {
    console.error('Error fetching answers:', error)
    return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, questionId, authorId, isAiGenerated } = await request.json()

    if (!content || !questionId || !authorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const answer = await prisma.answer.create({
      data: {
        content,
        questionId,
        authorId,
        isAiGenerated: isAiGenerated || false
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

    // Transform to match frontend interface
    const transformedAnswer = {
      id: answer.id,
      question_id: parseInt(questionId.slice(-8), 16),
      content: answer.content,
      username: answer.author.name,
      created_at: answer.createdAt.toISOString(),
      is_ai_generated: answer.isAiGenerated,
      votes: 0,
      authorId: answer.author.id
    }

    return NextResponse.json({ answer: transformedAnswer })
  } catch (error) {
    console.error('Error creating answer:', error)
    return NextResponse.json({ error: 'Failed to create answer' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { answerId, content, userId } = await request.json()

    if (!answerId || !userId) {
      return NextResponse.json({ error: 'Answer ID and User ID required' }, { status: 400 })
    }

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Find the answer to check permissions
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
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
            votes: true
          }
        }
      }
    })

    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
    }

    // Check if user can edit (only answer author)
    if (answer.authorId !== userId) {
      return NextResponse.json({ error: 'Unauthorized to edit this answer' }, { status: 403 })
    }

    // Update the answer
    const updatedAnswer = await prisma.answer.update({
      where: { id: answerId },
      data: {
        content: content.trim(),
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
            votes: true
          }
        }
      }
    })

    // Transform to match frontend interface
    const transformedAnswer = {
      id: updatedAnswer.id,
      question_id: parseInt(updatedAnswer.questionId.slice(-8), 16),
      content: updatedAnswer.content,
      username: updatedAnswer.author.name,
      authorProfilePicture: updatedAnswer.author.profilePicture,
      created_at: updatedAnswer.createdAt.toISOString(),
      updated_at: updatedAnswer.updatedAt.toISOString(),
      is_ai_generated: updatedAnswer.isAiGenerated,
      votes: 0, // Will be calculated by the frontend
      authorId: updatedAnswer.author.id
    }

    return NextResponse.json({ 
      success: true, 
      answer: transformedAnswer 
    })
  } catch (error) {
    console.error('Error updating answer:', error)
    return NextResponse.json({ error: 'Failed to update answer' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const answerId = searchParams.get('answerId')
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')

    if (!answerId || !userId) {
      return NextResponse.json({ error: 'Answer ID and User ID required' }, { status: 400 })
    }

    // Find the answer to check permissions
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: {
        author: true,
        question: {
          include: {
            class: {
              include: {
                teacher: true
              }
            }
          }
        }
      }
    })

    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
    }

    // Check if user can delete (answer author or teacher of the class)
    const canDelete = answer.authorId === userId || 
                     answer.question.class.teacherId === userId ||
                     userRole === 'TEACHER'

    if (!canDelete) {
      return NextResponse.json({ error: 'Unauthorized to delete this answer' }, { status: 403 })
    }

    await prisma.answer.delete({
      where: { id: answerId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting answer:', error)
    return NextResponse.json({ error: 'Failed to delete answer' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID required' }, { status: 400 })
    }

    // Get all classes taught by this teacher
    const taughtClasses = await prisma.class.findMany({
      where: { teacherId },
      select: { id: true, name: true, code: true }
    })

    if (taughtClasses.length === 0) {
      return NextResponse.json({ 
        success: true, 
        unansweredQuestions: [],
        totalUnanswered: 0
      })
    }

    const classIds = taughtClasses.map(c => c.id)

    // Get unanswered questions from all classes taught by this teacher
    const unansweredQuestions = await prisma.question.findMany({
      where: {
        classId: { in: classIds },
        answers: {
          none: {} // Questions with no answers
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            code: true
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
        createdAt: 'desc' // Most recent first
      }
    })

    // Transform to match frontend interface
    const transformedQuestions = unansweredQuestions.map((question: any) => {
      const upVotes = question.votes.filter((vote: any) => vote.type === 'UP').length
      const downVotes = question.votes.filter((vote: any) => vote.type === 'DOWN').length
      
      return {
        id: question.id,
        title: question.title,
        content: question.content,
        tags: JSON.parse(question.tags || '[]'),
        username: question.author.name,
        authorEmail: question.author.email,
        created_at: question.createdAt.toISOString(),
        votes: upVotes - downVotes,
        authorId: question.author.id,
        classId: question.class.id,
        className: question.class.name,
        classCode: question.class.code,
        timeSinceCreated: getTimeSinceCreated(question.createdAt)
      }
    })

    return NextResponse.json({ 
      success: true, 
      unansweredQuestions: transformedQuestions,
      totalUnanswered: transformedQuestions.length
    })
  } catch (error) {
    console.error('Error fetching unanswered questions:', error)
    return NextResponse.json({ error: 'Failed to fetch unanswered questions' }, { status: 500 })
  }
}

function getTimeSinceCreated(createdAt: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - createdAt.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}

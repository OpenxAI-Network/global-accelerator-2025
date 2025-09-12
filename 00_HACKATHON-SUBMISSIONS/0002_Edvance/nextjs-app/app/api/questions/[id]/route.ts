import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const questionId = params.id

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 })
    }

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
        },
        votes: {
          select: {
            type: true,
            userId: true
          }
        }
      }
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const upVotes = question.votes.filter((vote: any) => vote.type === 'UP').length
    const downVotes = question.votes.filter((vote: any) => vote.type === 'DOWN').length
    
    // Find user's vote if userId provided
    let userVote = null
    if (userId) {
      const userVoteRecord = question.votes.find((vote: any) => vote.userId === userId)
      if (userVoteRecord) {
        userVote = userVoteRecord.type.toLowerCase()
      }
    }

    const transformedQuestion = {
      id: question.id,
      title: question.title,
      content: question.content,
      tags: JSON.parse(question.tags || '[]'),
      username: question.author.name,
      created_at: question.createdAt.toISOString(),
      answer_count: question._count.answers,
      votes: upVotes - downVotes,
      authorId: question.author.id,
      userVote: userVote,
      authorProfilePicture: question.author.profilePicture
    }

    return NextResponse.json({ 
      success: true, 
      question: transformedQuestion 
    })
  } catch (error) {
    console.error('Error fetching question:', error)
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 })
  }
}
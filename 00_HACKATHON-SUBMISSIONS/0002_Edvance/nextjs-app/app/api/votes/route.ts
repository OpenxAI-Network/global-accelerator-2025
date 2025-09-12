import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, questionId, answerId, type } = await request.json()

    if (!userId || !type || (!questionId && !answerId)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['UP', 'DOWN'].includes(type)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let existingVote = null
    let newVote = null

    if (questionId) {
      // Handle question voting
      existingVote = await prisma.vote.findUnique({
        where: {
          userId_questionId: {
            userId,
            questionId
          }
        }
      })

      if (existingVote) {
        if (existingVote.type === type) {
          // Same vote type - remove the vote
          await prisma.vote.delete({
            where: { id: existingVote.id }
          })
          
          // Calculate new vote count (UP votes - DOWN votes)
          const upVotes = await prisma.vote.count({
            where: { 
              questionId,
              type: 'UP'
            }
          })
          const downVotes = await prisma.vote.count({
            where: { 
              questionId,
              type: 'DOWN'
            }
          })
          const voteCount = upVotes - downVotes
          
          return NextResponse.json({ 
            success: true, 
            newVoteCount: voteCount, 
            userVote: null 
          })
        } else {
          // Different vote type - update the vote
          newVote = await prisma.vote.update({
            where: { id: existingVote.id },
            data: { type: type as 'UP' | 'DOWN' }
          })
          
          // Calculate new vote count (UP votes - DOWN votes)
          const upVotes = await prisma.vote.count({
            where: { 
              questionId,
              type: 'UP'
            }
          })
          const downVotes = await prisma.vote.count({
            where: { 
              questionId,
              type: 'DOWN'
            }
          })
          const voteCount = upVotes - downVotes
          
          return NextResponse.json({ 
            success: true, 
            newVoteCount: voteCount, 
            userVote: type.toLowerCase() 
          })
        }
      } else {
        // No existing vote - create new vote
        newVote = await prisma.vote.create({
          data: {
            userId,
            questionId,
            type: type as 'UP' | 'DOWN'
          }
        })
        
        // Calculate new vote count (UP votes - DOWN votes)
        const upVotes = await prisma.vote.count({
          where: { 
            questionId,
            type: 'UP'
          }
        })
        const downVotes = await prisma.vote.count({
          where: { 
            questionId,
            type: 'DOWN'
          }
        })
        const voteCount = upVotes - downVotes
        
        return NextResponse.json({ 
          success: true, 
          newVoteCount: voteCount, 
          userVote: type.toLowerCase() 
        })
      }
    } else if (answerId) {
      // Handle answer voting
      existingVote = await prisma.vote.findUnique({
        where: {
          userId_answerId: {
            userId,
            answerId
          }
        }
      })

      if (existingVote) {
        if (existingVote.type === type) {
          // Same vote type - remove the vote
          await prisma.vote.delete({
            where: { id: existingVote.id }
          })
          
          // Calculate new vote count (UP votes - DOWN votes)
          const upVotes = await prisma.vote.count({
            where: { 
              answerId,
              type: 'UP'
            }
          })
          const downVotes = await prisma.vote.count({
            where: { 
              answerId,
              type: 'DOWN'
            }
          })
          const voteCount = upVotes - downVotes
          
          return NextResponse.json({ 
            success: true, 
            newVoteCount: voteCount, 
            userVote: null 
          })
        } else {
          // Different vote type - update the vote
          newVote = await prisma.vote.update({
            where: { id: existingVote.id },
            data: { type: type as 'UP' | 'DOWN' }
          })
          
          // Calculate new vote count (UP votes - DOWN votes)
          const upVotes = await prisma.vote.count({
            where: { 
              answerId,
              type: 'UP'
            }
          })
          const downVotes = await prisma.vote.count({
            where: { 
              answerId,
              type: 'DOWN'
            }
          })
          const voteCount = upVotes - downVotes
          
          return NextResponse.json({ 
            success: true, 
            newVoteCount: voteCount, 
            userVote: type.toLowerCase() 
          })
        }
      } else {
        // No existing vote - create new vote
        newVote = await prisma.vote.create({
          data: {
            userId,
            answerId,
            type: type as 'UP' | 'DOWN'
          }
        })
        
        // Calculate new vote count (UP votes - DOWN votes)
        const upVotes = await prisma.vote.count({
          where: { 
            answerId,
            type: 'UP'
          }
        })
        const downVotes = await prisma.vote.count({
          where: { 
            answerId,
            type: 'DOWN'
          }
        })
        const voteCount = upVotes - downVotes
        
        return NextResponse.json({ 
          success: true, 
          newVoteCount: voteCount, 
          userVote: type.toLowerCase() 
        })
      }
    }

  } catch (error) {
    console.error('Error handling vote:', error)
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const questionId = searchParams.get('questionId')
    const answerId = searchParams.get('answerId')

    if (!userId || (!questionId && !answerId)) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    let vote = null

    if (questionId) {
      vote = await prisma.vote.findUnique({
        where: {
          userId_questionId: {
            userId,
            questionId
          }
        }
      })
    } else if (answerId) {
      vote = await prisma.vote.findUnique({
        where: {
          userId_answerId: {
            userId,
            answerId
          }
        }
      })
    }

    return NextResponse.json({ 
      vote: vote ? vote.type.toLowerCase() : null 
    })
  } catch (error) {
    console.error('Error fetching vote:', error)
    return NextResponse.json({ error: 'Failed to fetch vote' }, { status: 500 })
  }
}

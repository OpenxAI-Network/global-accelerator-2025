import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { question, aiResponse, wasHelpful, classId, userId } = await request.json()

    if (!question || !aiResponse || typeof wasHelpful !== 'boolean' || !classId || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: question, aiResponse, wasHelpful, classId, userId' 
      }, { status: 400 })
    }

    // Verify user and class access
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Find class by ID or code (case-insensitive for SQLite)
    const classData = await prisma.class.findFirst({
      where: {
        OR: [
          { id: classId },
          { code: classId.toUpperCase() },
          { code: classId.toLowerCase() }
        ]
      }
    })

    if (!classData) {
      return NextResponse.json({ success: false, error: 'Class not found' }, { status: 404 })
    }

    // Check if user is enrolled or is the teacher
    const enrollment = await prisma.classEnrollment.findFirst({
      where: {
        userId: userId,
        classId: classData.id
      }
    })

    const isTeacher = classData.teacherId === userId
    if (!enrollment && !isTeacher) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not enrolled in this class' 
      }, { status: 403 })
    }

    // Save feedback
    const feedback = await prisma.aiFeedback.create({
      data: {
        question,
        aiResponse,
        wasHelpful,
        userId,
        classId: classData.id
      }
    })

    // Update class accuracy metrics
    await updateClassAccuracy(classData.id)

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        wasHelpful: feedback.wasHelpful,
        createdAt: feedback.createdAt
      }
    })

  } catch (error) {
    console.error('AI Feedback Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

async function updateClassAccuracy(classId: string) {
  try {
    // Get all feedback for this class
    const allFeedback = await prisma.aiFeedback.findMany({
      where: { classId }
    })

    const totalFeedback = allFeedback.length
    const helpfulFeedback = allFeedback.filter(f => f.wasHelpful).length
    const accuracyRate = totalFeedback > 0 ? helpfulFeedback / totalFeedback : 0

    // Update or create accuracy record
    await prisma.classAccuracy.upsert({
      where: { classId },
      update: {
        totalFeedback,
        helpfulFeedback,
        accuracyRate,
        lastUpdated: new Date()
      },
      create: {
        classId,
        totalFeedback,
        helpfulFeedback,
        accuracyRate,
        lastUpdated: new Date()
      }
    })

  } catch (error) {
    console.error('Error updating class accuracy:', error)
  }
}

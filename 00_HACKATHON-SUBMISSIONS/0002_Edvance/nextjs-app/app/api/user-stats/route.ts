import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')

    if (!userId || !userRole) {
      return NextResponse.json({ error: 'User ID and role required' }, { status: 400 })
    }

    // Get start of current week (Sunday)
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)

    if (userRole === 'STUDENT' || userRole === 'student') {
      // Student stats
      
      // Get enrolled classes count
      const totalClasses = await prisma.classEnrollment.count({
        where: { userId }
      })

      // Get active discussions (questions with recent activity in enrolled classes)
      const enrolledClasses = await prisma.classEnrollment.findMany({
        where: { userId },
        select: { classId: true }
      })
      const classIds = enrolledClasses.map(e => e.classId)

      const activeDiscussions = await prisma.question.count({
        where: {
          classId: { in: classIds },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })

      // Get total classmates (other students in same classes)
      const classmatesData = await prisma.classEnrollment.findMany({
        where: {
          classId: { in: classIds },
          userId: { not: userId }
        },
        distinct: ['userId']
      })
      const classmates = classmatesData.length

      // Get questions asked this week by this student
      const weeklyActivity = await prisma.question.count({
        where: {
          authorId: userId,
          createdAt: { gte: weekStart }
        }
      })

      return NextResponse.json({
        totalClasses,
        activeDiscussions,
        classmates,
        weeklyActivity,
        activityLabel: 'Questions Asked'
      })

    } else {
      // Teacher stats
      
      // Get classes taught
      const totalClasses = await prisma.class.count({
        where: { teacherId: userId }
      })

      // Get active discussions in taught classes
      const taughtClasses = await prisma.class.findMany({
        where: { teacherId: userId },
        select: { id: true }
      })
      const classIds = taughtClasses.map(c => c.id)

      const activeDiscussions = await prisma.question.count({
        where: {
          classId: { in: classIds },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })

      // Get total students across all taught classes
      const classmates = await prisma.classEnrollment.count({
        where: { classId: { in: classIds } }
      })

      // Get answers provided this week by this teacher
      const weeklyActivity = await prisma.answer.count({
        where: {
          authorId: userId,
          createdAt: { gte: weekStart }
        }
      })

      // Get unanswered questions count for this teacher
      const unansweredQuestions = await prisma.question.count({
        where: {
          classId: { in: classIds },
          answers: {
            none: {} // Questions with no answers
          }
        }
      })

      return NextResponse.json({
        totalClasses,
        activeDiscussions,
        classmates,
        weeklyActivity,
        activityLabel: 'Answers Provided',
        unansweredQuestions
      })
    }

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

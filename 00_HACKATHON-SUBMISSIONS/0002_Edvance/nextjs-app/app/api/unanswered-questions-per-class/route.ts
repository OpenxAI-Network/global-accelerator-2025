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
        classUnansweredCounts: []
      })
    }

    const classIds = taughtClasses.map(c => c.id)

    // Get unanswered questions count for each class
    const unansweredCounts = await Promise.all(
      classIds.map(async (classId) => {
        const count = await prisma.question.count({
          where: {
            classId,
            answers: {
              none: {} // Questions with no answers
            }
          }
        })

        const classInfo = taughtClasses.find(c => c.id === classId)
        console.log(`Class ${classInfo?.code} (${classId}): ${count} unanswered questions`)
        return {
          classId,
          className: classInfo?.name || '',
          classCode: classInfo?.code || '',
          unansweredCount: count
        }
      })
    )

    return NextResponse.json({ 
      success: true, 
      classUnansweredCounts: unansweredCounts
    })
  } catch (error) {
    console.error('Error fetching unanswered questions per class:', error)
    return NextResponse.json({ error: 'Failed to fetch unanswered questions per class' }, { status: 500 })
  }
}


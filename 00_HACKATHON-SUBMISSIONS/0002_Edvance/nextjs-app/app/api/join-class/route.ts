import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { courseCode, userId } = await request.json()

    if (!courseCode || !userId) {
      return NextResponse.json({ error: 'Course code and user ID required' }, { status: 400 })
    }

    // Find the class by course code
    const classToJoin = await prisma.class.findFirst({
      where: { 
        code: courseCode.toUpperCase() // Make course code case-insensitive
      }
    })

    if (!classToJoin) {
      return NextResponse.json({ error: 'Class not found with that course code' }, { status: 404 })
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.classEnrollment.findFirst({
      where: {
        userId,
        classId: classToJoin.id
      }
    })

    if (existingEnrollment) {
      return NextResponse.json({ error: 'You are already enrolled in this class' }, { status: 409 })
    }

    // Check if user is trying to join their own class (if they're a teacher)
    if (classToJoin.teacherId === userId) {
      return NextResponse.json({ error: 'You cannot join your own class as a student' }, { status: 400 })
    }

    // Create the enrollment
    const enrollment = await prisma.classEnrollment.create({
      data: {
        userId,
        classId: classToJoin.id
      },
      include: {
        class: {
          include: {
            teacher: {
              select: {
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                enrollments: true,
                questions: true
              }
            }
          }
        }
      }
    })

    // Transform to match frontend interface
    const transformedClass = {
      id: enrollment.class.id,
      name: enrollment.class.name,
      code: enrollment.class.code,
      description: enrollment.class.description,
      teacher: enrollment.class.teacher.name,
      teacherId: enrollment.class.teacherId,
      studentCount: enrollment.class._count.enrollments,
      questionCount: enrollment.class._count.questions
    }

    return NextResponse.json({ 
      success: true, 
      class: transformedClass,
      message: `Successfully joined ${enrollment.class.name}!`
    })

  } catch (error) {
    console.error('Error joining class:', error)
    return NextResponse.json({ error: 'Failed to join class' }, { status: 500 })
  }
}

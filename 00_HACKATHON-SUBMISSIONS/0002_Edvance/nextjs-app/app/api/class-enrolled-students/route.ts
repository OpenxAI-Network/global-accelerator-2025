import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    if (!classId) {
      return NextResponse.json({ error: 'Class ID required' }, { status: 400 })
    }

    // Get enrolled students for the class
    const enrollments = await prisma.classEnrollment.findMany({
      where: { classId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            graduationYear: true,
            degree: true,
            major: true,
            role: true,
            profilePicture: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        enrolledAt: 'asc'
      }
    })

    // Transform the data to return just the user information
    const students = enrollments.map(enrollment => ({
      ...enrollment.user,
      enrolledAt: enrollment.enrolledAt
    }))

    return NextResponse.json({ 
      success: true, 
      students 
    })

  } catch (error) {
    console.error('Error fetching enrolled students:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch enrolled students' 
    }, { status: 500 })
  }
}

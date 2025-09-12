import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    if (!classId) {
      return NextResponse.json({ error: 'Class ID required' }, { status: 400 })
    }

    // Try to find class by ID or by code
    let classData = await prisma.class.findFirst({
      where: {
        OR: [
          { id: classId },
          { code: classId.toUpperCase() }
        ]
      },
      include: {
        teacher: {
          select: {
            id: true,
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
    })

    if (!classData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Class not found' 
      }, { status: 404 })
    }

    // Transform to match frontend interface
    const transformedClass = {
      id: classData.id,
      name: classData.name,
      code: classData.code,
      description: classData.description,
      instructor: classData.teacher.name,
      semester: classData.semester,
      studentCount: classData._count.enrollments,
      color: getClassColor(classData.code)
    }

    return NextResponse.json({ 
      success: true, 
      class: transformedClass 
    })

  } catch (error) {
    console.error('Error fetching class details:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch class details' 
    }, { status: 500 })
  }
}

function getClassColor(code: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-orange-500'
  ]
  
  // Generate consistent color based on class code
  let hash = 0
  for (let i = 0; i < code.length; i++) {
    hash = ((hash << 5) - hash) + code.charCodeAt(i)
    hash = hash & hash // Convert to 32bit integer
  }
  
  return colors[Math.abs(hash) % colors.length]
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    let classes

    if (userRole === 'TEACHER' || userRole === 'teacher') {
      // Teachers see all classes, with flag for which ones they teach
      classes = await prisma.class.findMany({
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // Students see only enrolled classes
      const enrollments = await prisma.classEnrollment.findMany({
        where: { userId },
        include: {
          class: {
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
          }
        }
      })
      classes = enrollments.map(enrollment => enrollment.class)
    }

    // Transform to match frontend interface
    const transformedClasses = classes.map((cls: any) => ({
      id: cls.id,
      name: cls.name,
      code: cls.code,
      description: cls.description,
      instructor: cls.teacher.name,
      semester: cls.semester,
      students: cls._count.enrollments,
      discussions: cls._count.questions,
      studentCount: cls._count.enrollments,
      recentActivity: `${cls._count.questions} discussions`,
      color: getClassColor(cls.code)
    }))

    return NextResponse.json({ classes: transformedClasses })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, code, description, semester, teacherId } = await request.json()

    if (!name || !code || !teacherId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if class code already exists
    const existingClass = await prisma.class.findUnique({
      where: { code }
    })

    if (existingClass) {
      return NextResponse.json({ error: 'Class code already exists' }, { status: 400 })
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        code,
        description,
        semester,
        teacherId
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

    // Transform to match frontend interface
    const transformedClass = {
      id: newClass.id,
      name: newClass.name,
      code: newClass.code,
      description: newClass.description,
      instructor: newClass.teacher.name,
      semester: newClass.semester,
      students: newClass._count.enrollments,
      discussions: newClass._count.questions,
      studentCount: newClass._count.enrollments,
      recentActivity: `${newClass._count.questions} discussions`,
      color: getClassColor(newClass.code)
    }

    return NextResponse.json({ class: transformedClass })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, code, description, semester, teacherId } = await request.json()

    if (!id || !name || !code || !teacherId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user is the teacher of this class
    const existingClass = await prisma.class.findUnique({
      where: { id }
    })

    if (!existingClass || existingClass.teacherId !== teacherId) {
      return NextResponse.json({ error: 'Unauthorized to update this class' }, { status: 403 })
    }

    // Check if new class code conflicts with existing classes (excluding current class)
    if (code !== existingClass.code) {
      const codeConflict = await prisma.class.findFirst({
        where: { 
          code,
          id: { not: id }
        }
      })

      if (codeConflict) {
        return NextResponse.json({ error: 'Class code already exists' }, { status: 400 })
      }
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name,
        code,
        description,
        semester
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

    // Transform to match frontend interface
    const transformedClass = {
      id: updatedClass.id,
      name: updatedClass.name,
      code: updatedClass.code,
      description: updatedClass.description,
      instructor: updatedClass.teacher.name,
      semester: updatedClass.semester,
      students: updatedClass._count.enrollments,
      discussions: updatedClass._count.questions,
      studentCount: updatedClass._count.enrollments,
      recentActivity: `${updatedClass._count.questions} discussions`,
      color: getClassColor(updatedClass.code)
    }

    return NextResponse.json({ class: transformedClass })
  } catch (error) {
    console.error('Error updating class:', error)
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const userId = searchParams.get('userId')

    if (!classId || !userId) {
      return NextResponse.json({ error: 'Class ID and User ID required' }, { status: 400 })
    }

    // Verify user is the teacher of this class
    const classToDelete = await prisma.class.findUnique({
      where: { id: classId }
    })

    if (!classToDelete || classToDelete.teacherId !== userId) {
      return NextResponse.json({ error: 'Unauthorized to delete this class' }, { status: 403 })
    }

    await prisma.class.delete({
      where: { id: classId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 })
  }
}

function getClassColor(code: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500'
  ]
  
  const hash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { prisma } from '../../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const classId = searchParams.get('classId')

    if (!userId || !classId) {
      return NextResponse.json({ error: 'User ID and Class ID are required' }, { status: 400 })
    }

    // Verify user has access to this document
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the class to check if user is the teacher (try by ID or code)
    const classData = await prisma.class.findFirst({
      where: {
        OR: [
          { id: classId },
          { code: classId.toUpperCase() }
        ]
      },
      include: {
        teacher: {
          select: {
            id: true
          }
        }
      }
    })

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Check if user is the teacher of this class
    const isTeacher = classData.teacher.id === userId

    // If not teacher, check if user is enrolled as a student
    if (!isTeacher) {
      const enrollment = await prisma.classEnrollment.findFirst({
        where: {
          userId,
          classId: classData.id
        }
      })

      if (!enrollment) {
        return NextResponse.json({ 
          error: 'You must be enrolled in this class to access documents'
        }, { status: 403 })
      }
    }

    // Find the document in the database using the actual class ID
    const document = await prisma.document.findFirst({
      where: {
        filename: params.filename,
        classId: classData.id
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Construct file path
    const uploadsDir = path.join(process.cwd(), 'uploads')
    const filePath = path.join(uploadsDir, params.filename)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath)
    const fileStats = fs.statSync(filePath)

    // Determine content type based on file extension
    const ext = path.extname(params.filename).toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf'
        break
      case '.txt':
        contentType = 'text/plain'
        break
      case '.doc':
        contentType = 'application/msword'
        break
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break
      case '.rtf':
        contentType = 'application/rtf'
        break
    }

    // Create response with appropriate headers
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStats.size.toString(),
        'Content-Disposition': `inline; filename="${document.title || params.filename}"`,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

    return response

  } catch (error) {
    console.error('Error serving document:', error)
    return NextResponse.json({ error: 'Failed to serve document' }, { status: 500 })
  }
}

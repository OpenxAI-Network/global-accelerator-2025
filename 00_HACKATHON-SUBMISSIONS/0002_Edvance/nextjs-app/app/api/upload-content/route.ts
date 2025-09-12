import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import pool from '../../../lib/database'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}_${file.name}`
    const filePath = join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save file info to database
    const query = `
      INSERT INTO content (filename, filepath, file_type, uploaded_at)
      VALUES ($1, $2, $3, NOW())
    `

    if (!pool) {
      return NextResponse.json({ 
        success: false, 
        message: 'Database not available',
        demo: true 
      })
    }

    const result = await pool.query(query, [
      file.name,
      `/uploads/${filename}`,
      file.type
    ])

    return NextResponse.json({ 
      content: result.rows[0],
      message: 'File uploaded successfully'
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}


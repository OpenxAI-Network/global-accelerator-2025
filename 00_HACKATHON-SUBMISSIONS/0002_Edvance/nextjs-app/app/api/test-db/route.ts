import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // Test database connection using Prisma
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`
    
    return NextResponse.json({ 
      status: 'Database connected successfully',
      timestamp: result[0].current_time,
      message: 'AI Discussion Forum database is ready!'
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        demo: true
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, role } = await request.json()

    // Validation
    if (!email || !name || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 })
    }

    if (!['student', 'teacher'].includes(role.toLowerCase())) {
      return NextResponse.json({ error: 'Role must be either student or teacher' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password, // In production, you'd hash this
        role: role.toUpperCase() as 'STUDENT' | 'TEACHER',
        isDemo: false
      }
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ 
      user: userWithoutPassword,
      message: 'Account created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}

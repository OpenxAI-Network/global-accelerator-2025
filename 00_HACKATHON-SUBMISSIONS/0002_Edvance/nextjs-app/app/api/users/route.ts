import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, name, role, isDemo, password } = await request.json()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // For login purposes, check password if provided
      if (password && existingUser.password !== password) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }
      // Return user without password and convert role to lowercase
      const { password: _, ...userWithoutPassword } = existingUser
      const userForFrontend = {
        ...userWithoutPassword,
        role: userWithoutPassword.role.toLowerCase() as 'teacher' | 'student'
      }
      return NextResponse.json({ user: userForFrontend })
    }

    // Create new user (for demo accounts or auto-creation)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: password || (role === 'teacher' ? 'Chen102!' : 'Alice102!'), // Different default passwords for teachers vs students
        role: role === 'teacher' ? 'TEACHER' : 'STUDENT',
        isDemo: isDemo || false
      }
    })

    // Return user without password and convert role to lowercase
    const { password: _, ...userWithoutPassword } = user
    const userForFrontend = {
      ...userWithoutPassword,
      role: userWithoutPassword.role.toLowerCase() as 'teacher' | 'student'
    }
    return NextResponse.json({ user: userForFrontend })
  } catch (error) {
    console.error('Error creating/finding user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const id = searchParams.get('id')

    if (email) {
      const user = await prisma.user.findUnique({
        where: { email }
      })
      if (user) {
        const { password: _, ...userWithoutPassword } = user
        const userForFrontend = {
          ...userWithoutPassword,
          role: userWithoutPassword.role.toLowerCase() as 'teacher' | 'student'
        }
        return NextResponse.json({ user: userForFrontend })
      }
      return NextResponse.json({ user: null })
    }

    if (id) {
      const user = await prisma.user.findUnique({
        where: { id }
      })
      if (user) {
        const { password: _, ...userWithoutPassword } = user
        const userForFrontend = {
          ...userWithoutPassword,
          role: userWithoutPassword.role.toLowerCase() as 'teacher' | 'student'
        }
        return NextResponse.json({ user: userForFrontend })
      }
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ error: 'Email or ID required' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

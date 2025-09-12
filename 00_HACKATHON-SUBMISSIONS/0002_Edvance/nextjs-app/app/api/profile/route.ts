import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isDemo: true,
        bio: true,
        profilePicture: true,
        graduationYear: true,
        degree: true,
        major: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, name, bio, profilePicture, graduationYear, degree, major } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Verify user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if name is being updated and if it's different from current name
    const updateData: any = {
      bio,
      profilePicture,
      graduationYear,
      degree,
      major,
      updatedAt: new Date()
    }

    // Only update name if it's provided and different from current name
    if (name && name !== existingUser.name) {
      updateData.name = name
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isDemo: true,
        bio: true,
        profilePicture: true,
        graduationYear: true,
        degree: true,
        major: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ 
      user: updatedUser,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

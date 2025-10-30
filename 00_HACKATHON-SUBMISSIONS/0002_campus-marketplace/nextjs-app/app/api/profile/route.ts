import { NextRequest, NextResponse } from "next/server";

// In-memory storage for demo purposes
// In a real app, this would be a database
let userProfile: any = null;

export async function GET(request: NextRequest) {
  try {
    if (!userProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(userProfile);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to get profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.school) {
      return NextResponse.json(
        { error: "Name, email, and school are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Create profile
    const profile = {
      id: `user_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      school: data.school,
      verified: false, // In a real app, this would be set after email verification
      createdAt: new Date().toISOString(),
    };

    userProfile = profile;

    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to create profile" },
      { status: 500 }
    );
  }
}






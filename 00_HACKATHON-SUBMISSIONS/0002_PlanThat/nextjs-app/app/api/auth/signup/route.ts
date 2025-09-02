import { NextRequest, NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      username, 
      password, 
      email, 
      dob, 
      city, 
      country, 
      zipcode,
      bio,
      diet_restrictions,
      dislikes,
      food,
      drinks,
      nightlife,
      nature,
      arts,
      entertainment,
      sports,
      shopping,
      music
    } = body;

    if (!username || !password || !email || !dob || !city || !country || !zipcode) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Forward the request to Python backend
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        email,
        dob,
        city,
        country,
        zipcode,
        bio: bio || '',
        diet_restrictions: diet_restrictions || '',
        dislikes: dislikes || '',
        food: food || 5,
        drinks: drinks || 5,
        nightlife: nightlife || 5,
        nature: nature || 5,
        arts: arts || 5,
        entertainment: entertainment || 5,
        sports: sports || 5,
        shopping: shopping || 5,
        music: music || 5
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Signup failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      user: data.user,
      token: data.token
    });

  } catch (error) {
    console.error('Error forwarding signup to Python backend:', error);
    return NextResponse.json(
      { 
        error: 'Failed to connect to authentication service. Make sure the Python backend is running on port 5001.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
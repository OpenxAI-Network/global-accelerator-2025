import { NextRequest, NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Forward the request to Python backend
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Login failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      user: data.user,
      token: data.token
    });

  } catch (error) {
    console.error('Error forwarding login to Python backend:', error);
    return NextResponse.json(
      { 
        error: 'Failed to connect to authentication service. Make sure the Python backend is running on port 5001.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
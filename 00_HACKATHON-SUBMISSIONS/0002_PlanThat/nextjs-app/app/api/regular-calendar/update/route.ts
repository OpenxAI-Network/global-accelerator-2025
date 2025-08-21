import { NextRequest, NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, location, date, start_time, end_time, description, host_id } = body;

    // Validate required fields
    if (!event_id || !location || !date || !start_time || !end_time || !host_id) {
      return NextResponse.json(
        { error: 'Missing required fields: event_id, location, date, start_time, end_time, host_id' },
        { status: 400 }
      );
    }

    // Forward the request to Python backend
    const response = await fetch(`${PYTHON_BACKEND_URL}/regular_calendar/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_id,
        location,
        date,
        start_time,
        end_time,
        description: description || '',
        host_id
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to update event' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error forwarding regular calendar update request to Python backend:', error);
    return NextResponse.json(
      { 
        error: 'Failed to connect to regular calendar service. Make sure the Python backend is running on port 5001.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

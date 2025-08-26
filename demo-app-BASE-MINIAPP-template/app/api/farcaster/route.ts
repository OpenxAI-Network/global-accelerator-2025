import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const token = searchParams.get('token') || 'ETH';
    const days = parseInt(searchParams.get('days') || '7');

    if (action === 'mentions' || !action) {
      // For MVP testing, ONLY return ETH data from local database
      console.log(`🔍 MVP: Returning ETH-only data from local database...`);
      
      // Redirect to our local database endpoint
      const localResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/farcaster/local-mentions?token=${token}&days=${days}`);
      
      if (localResponse.ok) {
        const localData = await localResponse.json();
        return NextResponse.json(localData);
      } else {
        // Fallback to empty data
        return NextResponse.json({
          success: true,
          data: [],
          token: 'ETH',
          count: 0,
          source: 'mvp_fallback'
        });
      }
    }

    // Default response
    return NextResponse.json({
      success: false,
      error: 'Invalid action specified'
    });

  } catch (error) {
    console.error('MVP Farcaster API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      data: [],
      count: 0,
      source: 'error'
    });
  }
}

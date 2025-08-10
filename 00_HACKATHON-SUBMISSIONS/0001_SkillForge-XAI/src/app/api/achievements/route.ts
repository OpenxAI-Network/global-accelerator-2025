import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('points_reward', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data: achievements || [],
      count: achievements?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch achievements',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
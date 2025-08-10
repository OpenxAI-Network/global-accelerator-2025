import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        categories(name, color, icon)
      `)
      .eq('id', id)
      .single();
    
    if (error || !course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: course,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch course',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
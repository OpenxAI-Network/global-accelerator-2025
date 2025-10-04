import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    
    let query = supabase
      .from('courses')
      .select(`
        *,
        categories(name, color, icon)
      `)
      .eq('is_published', true);
    
    if (category && category !== 'all') {
      query = query.eq('categories.name', category);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    query = query.order('total_enrollments', { ascending: false }).limit(limit);
    
    const { data: courses, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data: courses || [],
      count: courses?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch courses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
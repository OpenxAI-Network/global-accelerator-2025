import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getUserProfile, createUserProfile } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let profile = await getUserProfile(user.id);
    
    if (!profile) {
      profile = await createUserProfile({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.email!.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
        learning_preferences: {},
        skill_level: 'beginner',
        total_points: 0,
        current_streak: 0,
        longest_streak: 0,
        timezone: 'UTC',
        language_preference: 'en',
        notification_settings: { email: true, push: true, achievements: true },
        subscription_tier: 'free'
      });
    }
    
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}
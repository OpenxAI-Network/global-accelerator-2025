import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables (SUPABASE_URL or SUPABASE_ANON_KEY)');
}

if (!supabaseServiceKey) {
  // The admin client is required for server-side writes bypassing RLS (e.g., token storage)
  throw new Error('Missing Supabase environment variable: SUPABASE_SERVICE_ROLE_KEY');
}

// Client for general operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database schema constants
export const TABLES = {
  USERS: 'users',
  STRAVA_TOKENS: 'strava_tokens',
  ACTIVITIES: 'activities',
  CLANS: 'clans',
  CLAN_MEMBERS: 'clan_members'
};

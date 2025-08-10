import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'

// Check if we're using placeholder values
const isPlaceholder = supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')

if (isPlaceholder && typeof window !== 'undefined') {
  console.warn('⚠️ Using placeholder Supabase credentials. Please update your .env.local file with real Supabase credentials.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => !isPlaceholder

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      learning_entries: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category: string
          difficulty: string
          duration_minutes: number
          ai_feedback: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category: string
          difficulty: string
          duration_minutes: number
          ai_feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category?: string
          difficulty?: string
          duration_minutes?: number
          ai_feedback?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          rarity: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description: string
          rarity: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          rarity?: string
          earned_at?: string
        }
      }
    }
  }
}
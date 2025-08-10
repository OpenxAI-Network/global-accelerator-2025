-- Fix enrollments table structure
-- Run this in your Supabase SQL editor

-- Add missing columns to enrollments table
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;

ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
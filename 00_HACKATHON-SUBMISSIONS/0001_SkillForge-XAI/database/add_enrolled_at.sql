-- Add enrolled_at column to enrollments table
-- Run this in your Supabase SQL editor

ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Force schema cache refresh
SELECT pg_notify('pgrst', 'reload schema');

-- Alternative: restart PostgREST (if above doesn't work)
-- You may need to restart your Supabase project or wait a few minutes
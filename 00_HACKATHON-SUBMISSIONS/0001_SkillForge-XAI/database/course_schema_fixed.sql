-- Fixed course schema - handles missing columns properly
-- Run this in your Supabase SQL editor

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructor_name TEXT NOT NULL DEFAULT 'AI Instructor',
  category_id UUID REFERENCES public.categories(id),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL DEFAULT 'beginner',
  estimated_duration_hours INTEGER NOT NULL DEFAULT 1,
  total_enrollments INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 4.5,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add is_published column to courses if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_published') THEN
    ALTER TABLE public.courses ADD COLUMN is_published BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add is_published column to lessons if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'is_published') THEN
    ALTER TABLE public.lessons ADD COLUMN is_published BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_percentage INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- User actions table
CREATE TABLE IF NOT EXISTS public.user_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  resource_id TEXT,
  resource_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to users table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_points') THEN
    ALTER TABLE public.users ADD COLUMN total_points INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'current_streak') THEN
    ALTER TABLE public.users ADD COLUMN current_streak INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_time_minutes') THEN
    ALTER TABLE public.users ADD COLUMN total_time_minutes INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_activity_date') THEN
    ALTER TABLE public.users ADD COLUMN last_activity_date DATE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Anyone can view course lessons" ON public.lessons;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can insert own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can view own actions" ON public.user_actions;
DROP POLICY IF EXISTS "Users can insert own actions" ON public.user_actions;

-- Create policies (wait for columns to exist)
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own enrollments" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments" ON public.enrollments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own actions" ON public.user_actions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own actions" ON public.user_actions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample data
INSERT INTO public.categories (name, description, color) 
SELECT 'Programming', 'Learn programming languages', '#3B82F6'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Programming');

INSERT INTO public.categories (name, description, color) 
SELECT 'Web Development', 'Frontend and backend development', '#10B981'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Web Development');

-- Create functions
CREATE OR REPLACE FUNCTION increment_course_enrollments(course_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.courses SET total_enrollments = total_enrollments + 1 WHERE id = course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION award_user_points(user_id UUID, points INTEGER, reason TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.users SET total_points = total_points + points WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
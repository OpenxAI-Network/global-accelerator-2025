-- Additional tables for course functionality
-- Run this in your Supabase SQL editor after the main schema

-- Categories table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE public.courses (
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

-- Lessons table
CREATE TABLE public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_percentage INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- User actions table for tracking
CREATE TABLE public.user_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  resource_id TEXT,
  resource_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update users table with additional fields
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_time_minutes INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- Enable RLS on new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Anyone can view course lessons" ON public.lessons
  FOR SELECT USING (is_published = true);

CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Users can view own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own enrollments" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments" ON public.enrollments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own actions" ON public.user_actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own actions" ON public.user_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample data
INSERT INTO public.categories (name, description, color) VALUES
  ('Programming', 'Learn programming languages and frameworks', '#3B82F6'),
  ('AI & Machine Learning', 'Artificial Intelligence and ML courses', '#8B5CF6'),
  ('Web Development', 'Frontend and backend web development', '#10B981'),
  ('Data Science', 'Data analysis and visualization', '#F59E0B');

INSERT INTO public.courses (title, description, instructor_name, category_id, difficulty_level, estimated_duration_hours) VALUES
  ('Introduction to React', 'Learn the fundamentals of React.js and build modern web applications', 'AI Instructor', (SELECT id FROM categories WHERE name = 'Web Development'), 'beginner', 8),
  ('Python for Data Science', 'Master Python programming for data analysis and machine learning', 'AI Instructor', (SELECT id FROM categories WHERE name = 'Data Science'), 'intermediate', 12),
  ('Machine Learning Basics', 'Understanding the fundamentals of machine learning algorithms', 'AI Instructor', (SELECT id FROM categories WHERE name = 'AI & Machine Learning'), 'beginner', 10);

-- Insert sample lessons
INSERT INTO public.lessons (course_id, title, duration_minutes, sort_order) VALUES
  ((SELECT id FROM courses WHERE title = 'Introduction to React'), 'What is React?', 45, 1),
  ((SELECT id FROM courses WHERE title = 'Introduction to React'), 'Setting up your development environment', 30, 2),
  ((SELECT id FROM courses WHERE title = 'Introduction to React'), 'Your first React component', 60, 3),
  ((SELECT id FROM courses WHERE title = 'Introduction to React'), 'Props and State', 75, 4);

-- Database functions for common operations
CREATE OR REPLACE FUNCTION increment_course_enrollments(course_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.courses 
  SET total_enrollments = total_enrollments + 1 
  WHERE id = course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION award_user_points(user_id UUID, points INTEGER, reason TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.users 
  SET total_points = total_points + points 
  WHERE id = user_id;
  
  INSERT INTO public.user_actions (user_id, action_type, metadata)
  VALUES (user_id, 'points_awarded', jsonb_build_object('points', points, 'reason', reason));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_user_learning_time(user_id UUID, minutes INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.users 
  SET total_time_minutes = total_time_minutes + minutes,
      last_activity_date = CURRENT_DATE
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_user_streak(user_id UUID)
RETURNS void AS $$
DECLARE
  last_activity DATE;
  current_streak INTEGER;
BEGIN
  SELECT last_activity_date, current_streak INTO last_activity, current_streak
  FROM public.users WHERE id = user_id;
  
  IF last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Continue streak
    UPDATE public.users 
    SET current_streak = current_streak + 1,
        last_activity_date = CURRENT_DATE
    WHERE id = user_id;
  ELSIF last_activity != CURRENT_DATE THEN
    -- Reset streak
    UPDATE public.users 
    SET current_streak = 1,
        last_activity_date = CURRENT_DATE
    WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
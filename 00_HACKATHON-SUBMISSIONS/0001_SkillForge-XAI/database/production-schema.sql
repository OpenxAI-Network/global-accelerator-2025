-- SkillForge-XAI Production Database Schema
-- Complete schema for production-ready AI learning platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  learning_preferences JSONB DEFAULT '{}',
  skill_level TEXT DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  timezone TEXT DEFAULT 'UTC',
  language_preference TEXT DEFAULT 'en',
  notification_settings JSONB DEFAULT '{"email": true, "push": true, "achievements": true}',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  instructor_name TEXT NOT NULL,
  instructor_bio TEXT,
  instructor_avatar TEXT,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  estimated_duration_hours INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  banner_url TEXT,
  price DECIMAL(10,2) DEFAULT 0.00,
  is_free BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  prerequisites TEXT[],
  learning_objectives TEXT[],
  tags TEXT[],
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  total_enrollments INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  lesson_type TEXT DEFAULT 'text' CHECK (lesson_type IN ('text', 'video', 'audio', 'interactive', 'quiz')),
  duration_minutes INTEGER DEFAULT 0,
  sort_order INTEGER NOT NULL,
  video_url TEXT,
  audio_url TEXT,
  attachments JSONB DEFAULT '[]',
  is_preview BOOLEAN DEFAULT false,
  ai_generated_summary TEXT,
  key_concepts TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  quiz_type TEXT DEFAULT 'practice' CHECK (quiz_type IN ('practice', 'assessment', 'final')),
  time_limit_minutes INTEGER,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  is_randomized BOOLEAN DEFAULT false,
  show_correct_answers BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'code')),
  options JSONB DEFAULT '[]', -- For multiple choice questions
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Course Enrollments
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_date TIMESTAMP WITH TIME ZONE,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  current_lesson_id UUID REFERENCES public.lessons(id),
  total_time_spent_minutes INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  certificate_issued BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  UNIQUE(user_id, course_id)
);

-- User Lesson Progress
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  bookmarked BOOLEAN DEFAULT false,
  UNIQUE(user_id, lesson_id)
);

-- Quiz Attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER DEFAULT 0,
  max_score INTEGER NOT NULL,
  percentage DECIMAL(5,2) DEFAULT 0.00,
  passed BOOLEAN DEFAULT false,
  time_taken_minutes INTEGER,
  answers JSONB DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false
);

-- AI Chat Sessions
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  session_type TEXT DEFAULT 'general' CHECK (session_type IN ('general', 'course_help', 'quiz_help', 'career_advice')),
  title TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_messages INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- AI Chat Messages
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  tokens_used INTEGER,
  model_used TEXT DEFAULT 'gpt-4',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements/Badges
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  badge_color TEXT DEFAULT '#3B82F6',
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  points_reward INTEGER DEFAULT 0,
  criteria JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

-- Learning Streaks
CREATE TABLE IF NOT EXISTS public.learning_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  streak_date DATE NOT NULL,
  activities_completed INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, streak_date)
);

-- Study Sessions
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  session_type TEXT DEFAULT 'lesson' CHECK (session_type IN ('lesson', 'quiz', 'practice', 'review')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 0,
  activities_completed INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  focus_score DECIMAL(3,2) DEFAULT 0.00
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'achievement', 'reminder')),
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Analytics
CREATE TABLE IF NOT EXISTS public.learning_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_time_minutes INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  streak_maintained BOOLEAN DEFAULT false,
  focus_score DECIMAL(3,2) DEFAULT 0.00,
  learning_velocity DECIMAL(5,2) DEFAULT 0.00,
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for Categories (public read)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (is_active = true);

-- RLS Policies for Courses (public read for published)
CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT USING (is_published = true);

-- RLS Policies for Lessons (enrolled users can view)
CREATE POLICY "Enrolled users can view lessons" ON public.lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE enrollments.user_id = auth.uid() 
    AND enrollments.course_id = lessons.course_id
  ) OR is_preview = true
);

-- RLS Policies for Quizzes (enrolled users can view)
CREATE POLICY "Enrolled users can view quizzes" ON public.quizzes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE enrollments.user_id = auth.uid() 
    AND enrollments.course_id = quizzes.course_id
  )
);

-- RLS Policies for Quiz Questions (enrolled users can view)
CREATE POLICY "Enrolled users can view quiz questions" ON public.quiz_questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    JOIN public.quizzes q ON q.course_id = e.course_id
    WHERE e.user_id = auth.uid() 
    AND q.id = quiz_questions.quiz_id
  )
);

-- RLS Policies for User-specific data
CREATE POLICY "Users can manage own enrollments" ON public.enrollments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own lesson progress" ON public.lesson_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own quiz attempts" ON public.quiz_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own chat sessions" ON public.ai_chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own chat messages" ON public.ai_chat_messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.ai_chat_sessions 
    WHERE ai_chat_sessions.id = ai_chat_messages.session_id 
    AND ai_chat_sessions.user_id = auth.uid()
  )
);
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage own user achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own learning streaks" ON public.learning_streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own study sessions" ON public.study_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own analytics" ON public.learning_analytics FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_sort ON public.lessons(course_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON public.ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.ai_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_streaks_user_date ON public.learning_streaks(user_id, streak_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
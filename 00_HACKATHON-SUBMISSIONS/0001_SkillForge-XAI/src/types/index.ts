export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  learning_preferences: Record<string, any>;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  total_points: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  timezone: string;
  language_preference: string;
  notification_settings: Record<string, any>;
  subscription_tier: 'free' | 'pro' | 'premium';
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  category_id?: string;
  category?: Category;
  instructor_name: string;
  instructor_bio?: string;
  instructor_avatar?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_duration_hours: number;
  thumbnail_url?: string;
  banner_url?: string;
  price: number;
  is_free: boolean;
  is_published: boolean;
  prerequisites: string[];
  learning_objectives: string[];
  tags: string[];
  rating: number;
  total_ratings: number;
  total_enrollments: number;
  completion_rate: number;
  lessons?: Lesson[];
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  course?: Course;
  title: string;
  description?: string;
  content: string;
  lesson_type: 'text' | 'video' | 'audio' | 'interactive' | 'quiz';
  duration_minutes: number;
  sort_order: number;
  video_url?: string;
  audio_url?: string;
  attachments: any[];
  is_preview: boolean;
  ai_generated_summary?: string;
  key_concepts: string[];
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  course_id?: string;
  lesson_id?: string;
  course?: Course;
  title: string;
  description?: string;
  quiz_type: 'practice' | 'assessment' | 'final';
  time_limit_minutes?: number;
  passing_score: number;
  max_attempts: number;
  is_randomized: boolean;
  show_correct_answers: boolean;
  questions?: QuizQuestion[];
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'code';
  options: string[];
  correct_answer: string;
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  sort_order: number;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  course?: Course;
  enrollment_date: string;
  completion_date?: string;
  progress_percentage: number;
  current_lesson_id?: string;
  total_time_spent_minutes: number;
  is_completed: boolean;
  certificate_issued: boolean;
  rating?: number;
  review?: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  enrollment_id: string;
  started_at: string;
  completed_at?: string;
  time_spent_minutes: number;
  progress_percentage: number;
  is_completed: boolean;
  notes?: string;
  bookmarked: boolean;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  enrollment_id?: string;
  attempt_number: number;
  started_at: string;
  completed_at?: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  time_taken_minutes?: number;
  answers: Record<string, any>;
  is_completed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  badge_color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points_reward: number;
  criteria: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achievement?: Achievement;
  earned_at: string;
  progress: Record<string, any>;
}

export interface AIChatSession {
  id: string;
  user_id: string;
  course_id?: string;
  lesson_id?: string;
  session_type: 'general' | 'course_help' | 'quiz_help' | 'career_advice';
  title?: string;
  started_at: string;
  ended_at?: string;
  total_messages: number;
  is_active: boolean;
  messages?: AIChatMessage[];
}

export interface AIChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any>;
  tokens_used?: number;
  model_used: string;
  created_at: string;
}

export interface LearningAnalytics {
  id: string;
  user_id: string;
  date: string;
  total_time_minutes: number;
  lessons_completed: number;
  quizzes_completed: number;
  points_earned: number;
  streak_maintained: boolean;
  focus_score: number;
  learning_velocity: number;
}

// Legacy interfaces for backward compatibility
export interface LearningEntry {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  ai_feedback?: string;
  ai_suggestions?: string[];
  completion_status: string;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  icon_url?: string;
  criteria?: Record<string, any>;
  earned_at: string;
}

export interface AITutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}